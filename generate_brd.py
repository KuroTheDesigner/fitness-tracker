import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# Define the BRD data based on the task.md and subagent verification
data = [
    ["Task", "Task Description", "Status"],
    
    # Audit Phase
    ["Run Playwright tests", "Execute automated testing via webapp-testing skill", "Tested (Green)"],
    ["Root cause analysis", "Analyze issues using systematic-debugging skill", "Tested (Green)"],
    ["Component review", "Review shadcn-ui components", "Tested (Green)"],
    ["Competitor research", "Research Hevy, Strong, NTC", "Tested (Green)"],
    ["Create audit report", "Compile findings into a comprehensive report", "Tested (Green)"],

    # Setup & Infrastructure
    ["Project setup", "Vite + React + Convex + Tailwind base setup", "Tested (Green)"],
    ["Design system", "Implement shadcn/ui and Radix UI components", "Tested (Green)"],
    ["Page layouts", "Develop 6 core page layouts (UI only)", "Tested (Green)"],
    ["Convex schema", "Design deterministic database schema", "Tested (Green)"],
    ["Live Deployment", "Deploy frontend to Vercel and backend to Convex Cloud", "Tested (Green)"],

    # Phase 1: Backend Integration
    ["HomePage Convex Sync", "Fetch dynamic schedule, 'today's workout', and add skeletons", "Tested (Green)"],
    ["WorkoutSummary Sync", "Fetch workout with exercises, display muscle group data", "Tested (Green)"],
    ["ActiveWorkout Sync", "Log sets dynamically, finish workout mutation", "Tested (Green)"],
    ["ProgressPage Sync", "Fetch user stats, PRs, and weekly activity", "Tested (Green)"],

    # Phase 2: Core Workout Functionality
    ["Set Completion Logging", "Manage state for sets, check off boxes to log", "Tested (Green)"],
    ["PR Trophy display", "Show PR icon on new personal record", "Complete (Dark Green)"],
    ["Rest Timer", "Countdown timer with sound notification", "Complete (Dark Green)"],
    ["Effort Rating Modal", "Easy/Ideal/Max options integrated with logSet", "Complete (Dark Green)"],
    ["Workout Timer", "Elapsed time counter starting on mount", "Tested (Green)"],
    ["Finish Workout Confirmation", "Show dialog summary before ending workout", "Tested (Green)"],

    # Phase 3: Exercise Management
    ["Exercise Detail Navigation", "Navigate to instructions via info icons", "Tested (Green)"],
    ["Exercise Swap Flow", "Search, filter, and swap exercises mid-workout", "Tested (Green)"],
    ["Custom Exercise Creation", "Modal to add user-defined exercises to DB", "Tested (Green)"],
    ["Exercise History Tracking", "Display past performance and charts in Detail view", "Tested (Green)"],

    # Phase 4: Analytics
    ["Real Progress Stats", "Show actual streak and PR count from database", "Tested (Green)"],
    ["Workout History View", "Calendar or list of past workouts", "Incomplete (Grey)"],
    ["Muscle Breakdown", "Display real data for muscle group focus", "Incomplete (Grey)"],

    # Phase 5: Polish & Testing
    ["Loading Skeletons", "Shimmer effects across all data-fetching pages", "In progress (Orange)"],
    ["Error Boundary/Toasts", "Global error handling and success notifications", "Incomplete (Grey)"],
    ["PR Celebration Animation", "Confetti effect for personal records", "Incomplete (Grey)"],
    ["Unit Tests", "Code-level tests for hooks and components", "Incomplete (Grey)"],
    ["E2E Tests", "Automated UI scenario tests", "Complete (Dark Green)"],
    ["Manual QA Verification", "Cross-referencing live build features in staging/prod", "Tested (Green)"]
]

# Color constants
STATUS_COLORS = {
    "Incomplete (Grey)": colors.Color(0.8, 0.8, 0.8),
    "In progress (Orange)": colors.Color(1.0, 0.65, 0.0),
    "Complete (Dark Green)": colors.Color(0.0, 0.5, 0.0),
    "Tested (Green)": colors.Color(0.2, 0.8, 0.2)
}

def generate_pdf(output_filename):
    doc = SimpleDocTemplate(output_filename, pagesize=landscape(letter),
                            rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    elements = []
    elements.append(Paragraph("Fitness Tracker application BRD", title_style))
    elements.append(Spacer(1, 20))
    
    # Process data for Table
    table_data = []
    
    # Header
    table_data.append([
        Paragraph("<b>Task</b>", styles['Normal']), 
        Paragraph("<b>Task Description</b>", styles['Normal']), 
        Paragraph("<b>Status</b>", styles['Normal'])
    ])
    
    # Helper to clean status text for styling
    for row in data[1:]:
        status_text = row[2]
        bg_color = STATUS_COLORS.get(status_text, colors.white)
        
        # We only color the column cells in the TableStyle, but text we just pass as Paragraphs
        task_p = Paragraph(row[0], styles['Normal'])
        desc_p = Paragraph(row[1], styles['Normal'])
        status_p = Paragraph(f"<b>{status_text}</b>", styles['Normal'])
        
        table_data.append([task_p, desc_p, status_p])
        
    t = Table(table_data, colWidths=[2.5*inch, 4.5*inch, 2*inch])
    
    # Base table style
    t_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#333333")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.black),
        ('BOX', (0, 0), (-1, -1), 0.25, colors.black),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ])
    
    # Add background colors for status column
    for i, row in enumerate(data):
        if i == 0: continue # skip header
        status_text = row[2]
        bg_color = STATUS_COLORS.get(status_text, colors.white)
        text_color = colors.white if "Dark Green" in status_text or "Grey" in status_text else colors.black
        
        t_style.add('BACKGROUND', (2, i), (2, i), bg_color)
        if text_color == colors.white:
            t_style.add('TEXTCOLOR', (2, i), (2, i), colors.white)
    
    t.setStyle(t_style)
    elements.append(t)
    
    doc.build(elements)

if __name__ == "__main__":
    out_path = os.path.join(r"C:\Users\Oshiogwe Ugbodaga\OneDrive\Documents\Coding stuff\Fitness Tracker", "BRD.pdf")
    generate_pdf(out_path)
    print(f"Generated BRD PDF at {out_path}")
