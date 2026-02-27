import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const PIN_REGEX = /^\d{4}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,24}$/;
const PIN_HASH_ITERATIONS = 210000;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const GUIDE_STEP_KEYS = ["addedExercise", "createdSuperset", "separatedSuperset"] as const;
const DEFAULT_GUIDE_STEPS = {
    addedExercise: false,
    createdSuperset: false,
    separatedSuperset: false,
};

const encoder = new TextEncoder();

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex: string) => {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex input");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
};

const constantTimeEqual = (a: string, b: string) => {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i += 1) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
};

const normalizeUsername = (username: string) => username.trim().toLowerCase();
const getUtcDateKey = () => new Date().toISOString().slice(0, 10);

const hashPin = async (pin: string, saltHex: string, iterations = PIN_HASH_ITERATIONS) => {
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveBits"]);
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: hexToBytes(saltHex),
            iterations,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );

    return bytesToHex(new Uint8Array(derivedBits));
};

const generateSaltHex = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
};

const generateSessionToken = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
};

const hashToken = async (token: string) => {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
    return bytesToHex(new Uint8Array(digest));
};

const assertValidSignUp = ({ firstName, username, pin }: { firstName: string; username: string; pin: string; }) => {
    const cleanFirstName = firstName.trim();
    const cleanUsername = username.trim();

    if (!cleanFirstName || cleanFirstName.length < 2 || cleanFirstName.length > 40) {
        throw new Error("First name must be between 2 and 40 characters.");
    }

    if (!USERNAME_REGEX.test(cleanUsername)) {
        throw new Error("Username must be 3-24 chars and use letters, numbers, ., _, or -.");
    }

    if (!PIN_REGEX.test(pin)) {
        throw new Error("PIN must be exactly 4 digits.");
    }
};

const issueCredentialSession = async (ctx: any, userId: any) => {
    const token = generateSessionToken();
    const tokenHash = await hashToken(token);
    const now = Date.now();

    await ctx.db.insert("credentialAuthSessions", {
        userId,
        tokenHash,
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS,
    });

    return token;
};

// Get current user from Shoo identity
export const current = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_shooSubject", (q) => q.eq("shooSubject", identity.subject))
            .unique();

        return user;
    },
});

// Called after first sign-in to create the user record
export const ensureUser = mutation({
    args: {
        allowCreate: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("users")
            .withIndex("by_shooSubject", (q) => q.eq("shooSubject", identity.subject))
            .unique();

        if (existing) {
            const providers = new Set(existing.authProviders || []);
            providers.add("google");
            await ctx.db.patch(existing._id, {
                authProviders: Array.from(providers),
                email: existing.email ?? identity.email ?? undefined,
                name: existing.name ?? identity.name ?? undefined,
                displayName: existing.displayName ?? identity.name ?? existing.name ?? undefined,
            });
            return existing._id;
        }

        if (!args.allowCreate) return null;

        return await ctx.db.insert("users", {
            shooSubject: identity.subject,
            name: identity.name ?? undefined,
            displayName: identity.name ?? undefined,
            email: identity.email ?? undefined,
            authProviders: ["google"],
            onboardingCompleted: false,
            onboardingGuideDateKey: getUtcDateKey(),
            onboardingGuideSteps: DEFAULT_GUIDE_STEPS,
            onboardingActiveWorkoutId: undefined,
            currentStreak: 0,
            longestStreak: 0,
            createdAt: Date.now(),
        });
    },
});

export const signUpWithCredentials = mutation({
    args: {
        firstName: v.string(),
        username: v.string(),
        pin: v.string(),
    },
    handler: async (ctx, args) => {
        assertValidSignUp(args);
        const normalized = normalizeUsername(args.username);

        const existing = await ctx.db
            .query("users")
            .withIndex("by_usernameNormalized", (q) => q.eq("usernameNormalized", normalized))
            .unique();

        if (existing) {
            throw new Error("Username is already in use.");
        }

        const saltHex = generateSaltHex();
        const pinHash = await hashPin(args.pin, saltHex, PIN_HASH_ITERATIONS);
        const trimmedFirstName = args.firstName.trim();
        const trimmedUsername = args.username.trim();

        const userId = await ctx.db.insert("users", {
            name: trimmedFirstName,
            displayName: trimmedFirstName,
            username: trimmedUsername,
            usernameNormalized: normalized,
            credentialPinHash: pinHash,
            credentialPinSalt: saltHex,
            credentialPinIterations: PIN_HASH_ITERATIONS,
            authProviders: ["credentials"],
            onboardingCompleted: false,
            onboardingGuideDateKey: getUtcDateKey(),
            onboardingGuideSteps: DEFAULT_GUIDE_STEPS,
            onboardingActiveWorkoutId: undefined,
            currentStreak: 0,
            longestStreak: 0,
            createdAt: Date.now(),
        });

        const sessionToken = await issueCredentialSession(ctx, userId);

        return {
            userId,
            sessionToken,
            username: trimmedUsername,
        };
    },
});

export const signInWithCredentials = mutation({
    args: {
        username: v.string(),
        pin: v.string(),
    },
    handler: async (ctx, args) => {
        const normalized = normalizeUsername(args.username);
        const invalidError = new Error("Invalid username or PIN.");

        if (!USERNAME_REGEX.test(args.username.trim()) || !PIN_REGEX.test(args.pin)) {
            throw invalidError;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_usernameNormalized", (q) => q.eq("usernameNormalized", normalized))
            .unique();

        if (!user?.credentialPinHash || !user.credentialPinSalt || !user.credentialPinIterations) {
            throw invalidError;
        }

        const candidateHash = await hashPin(args.pin, user.credentialPinSalt, user.credentialPinIterations);
        if (!constantTimeEqual(candidateHash, user.credentialPinHash)) {
            throw invalidError;
        }

        const sessionToken = await issueCredentialSession(ctx, user._id);

        return {
            userId: user._id,
            sessionToken,
            username: user.username || args.username.trim(),
        };
    },
});

export const getCurrentBySession = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const tokenHash = await hashToken(args.sessionToken);
        const session = await ctx.db
            .query("credentialAuthSessions")
            .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
            .unique();

        if (!session || session.expiresAt <= Date.now()) {
            return null;
        }

        const user = await ctx.db.get(session.userId);
        if (!user) return null;

        return user;
    },
});

export const signOutSession = mutation({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const tokenHash = await hashToken(args.sessionToken);
        const session = await ctx.db
            .query("credentialAuthSessions")
            .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
            .unique();

        if (session) {
            await ctx.db.delete(session._id);
        }

        return { success: true };
    },
});

export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const getOnboardingGuideState = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        const todayKey = getUtcDateKey();

        if (!user) {
            return {
                dateKey: todayKey,
                steps: DEFAULT_GUIDE_STEPS,
                completed: false,
                shouldReset: false,
            };
        }

        const storedSteps = user.onboardingGuideSteps || DEFAULT_GUIDE_STEPS;
        const shouldReset = user.onboardingCompleted !== true && user.onboardingGuideDateKey !== todayKey;

        return {
            dateKey: shouldReset ? todayKey : (user.onboardingGuideDateKey || todayKey),
            steps: shouldReset ? DEFAULT_GUIDE_STEPS : storedSteps,
            completed: storedSteps.addedExercise && storedSteps.createdSuperset && storedSteps.separatedSuperset,
            shouldReset,
        };
    },
});

export const upsertOnboardingGuideStep = mutation({
    args: {
        userId: v.id("users"),
        step: v.union(v.literal("addedExercise"), v.literal("createdSuperset"), v.literal("separatedSuperset")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        if (user.onboardingCompleted === true) {
            return {
                steps: user.onboardingGuideSteps || DEFAULT_GUIDE_STEPS,
                completed: true,
            };
        }

        const todayKey = getUtcDateKey();
        const shouldReset = user.onboardingGuideDateKey !== todayKey;
        const baseSteps = shouldReset ? { ...DEFAULT_GUIDE_STEPS } : { ...(user.onboardingGuideSteps || DEFAULT_GUIDE_STEPS) };
        baseSteps[args.step] = true;

        const nextSteps = {
            addedExercise: !!baseSteps.addedExercise,
            createdSuperset: !!baseSteps.createdSuperset,
            separatedSuperset: !!baseSteps.separatedSuperset,
        };

        await ctx.db.patch(args.userId, {
            onboardingGuideDateKey: todayKey,
            onboardingGuideSteps: nextSteps,
        });

        return {
            steps: nextSteps,
            completed: GUIDE_STEP_KEYS.every((key) => nextSteps[key] === true),
        };
    },
});

export const completeOnboarding = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        await ctx.db.patch(args.userId, {
            onboardingCompleted: true,
            onboardingCompletedAt: Date.now(),
            onboardingGuideDateKey: getUtcDateKey(),
            onboardingGuideSteps: {
                addedExercise: true,
                createdSuperset: true,
                separatedSuperset: true,
            },
            onboardingActiveWorkoutId: undefined,
        });

        return { success: true };
    },
});
