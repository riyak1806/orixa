# ORIXA — AGENTS.md

## 1. PROJECT IDENTITY

Orixa is an educational game/platform designed to make learning interactive, engaging, and visually enjoyable.

Orixa combines:
- Educational quizzes
- Puzzle/reveal gameplay
- Teacher tools
- Student learning
- Gamification
- Performance tracking

The project is intended to grow into a complete educational platform.

---

# 2. PRIMARY DEVELOPMENT PRINCIPLE

The existing Orixa project is the source of truth.

Before modifying anything:

1. Inspect the existing implementation.
2. Understand how the relevant feature currently works.
3. Reuse existing components, styles, utilities, and patterns whenever possible.
4. Make the smallest clean change necessary.
5. Do not rewrite unrelated parts of the application.

Never assume that a component needs to be rebuilt simply because a new feature requires it.

---

# 3. UI / DESIGN SYSTEM

The Orixa visual identity is already established.

All new interfaces must look like they belong to the existing Orixa game.

Preserve the existing:

- Color palette
- Background treatment
- Typography
- Font hierarchy
- Rounded corners
- Thick dark outlines
- Card styling
- Shadows
- Button styling
- Spacing system
- Animations
- Transitions
- Icon style

Do not introduce a completely different visual language.

The Teacher interface and Student interface should feel like extensions of the Orixa game rather than unrelated enterprise software.

---

# 4. COLORS

Reuse the colors already present in the project.

Do NOT introduce a new color palette unless explicitly requested.

Do not arbitrarily replace existing colors.

When creating a new component, inspect existing components and reuse their colors.

---

# 5. ICONOGRAPHY

Never use emojis as UI icons.

Use consistent monochrome icons/SVG icons.

Icons should:

- Have a consistent visual style
- Have consistent stroke weight
- Be appropriately sized
- Align correctly with text
- Include accessible labels when necessary

Do not mix unrelated icon libraries or visual styles without a specific reason.

---

# 6. ANIMATIONS

Orixa uses subtle, playful animations.

Reuse existing animations whenever possible.

Preferred animation behavior:

- Smooth hover transitions
- Subtle scale effects
- Gentle lift effects
- Fade transitions
- Existing floating/background animations
- Smooth sidebar transitions
- Button press feedback

Avoid:

- Excessive animations
- Flashing effects
- Aggressive motion
- Unnecessary page transitions
- Animations that interfere with usability

Animations must never cause layout shifting.

---

# 7. LAYOUT

Use structured layout systems such as:

- CSS Grid
- Flexbox
- Existing project layout utilities/components

Avoid unnecessary absolute positioning.

Maintain:

- Consistent alignment
- Consistent spacing
- Balanced whitespace
- Responsive layouts
- Clear visual hierarchy

Do not fix one alignment problem by creating another.

---

# 8. RESPONSIVE DESIGN

Every new interface must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Requirements:

- No unintended horizontal scrolling
- No overlapping elements
- No clipped text
- Buttons remain usable
- Cards reflow naturally
- Navigation adapts appropriately
- Inputs remain usable
- Typography remains readable

Do not simply shrink the desktop layout.

Use appropriate responsive layout behavior.

---

# 9. ACCESSIBILITY

Interactive elements must be accessible.

Use:

- Semantic HTML
- Keyboard-accessible controls
- Visible focus states
- Appropriate labels
- ARIA labels where necessary
- Sufficient contrast
- Clear error messages

Icon-only buttons must have accessible labels.

---

# 10. COMPONENT REUSE

Before creating a new component:

Check whether an existing component can be reused.

Prefer:

Existing component
→ Extend it if necessary
→ Create a new component only when genuinely required

Avoid duplicate components that perform the same function.

Avoid duplicate CSS.

---

# 11. TEACHER EXPERIENCE

The Teacher interface should feel like a natural extension of Orixa.

The Teacher Dashboard should function as a central Teacher Hub.

Core areas include:

- Dashboard
- Create Quiz
- Quiz Management
- Question Bank
- Students
- Results
- Past Quizzes
- Notifications
- Settings

Teacher screens should prioritize clarity and ease of use.

Do not turn the interface into a generic corporate/enterprise dashboard.

---

# 12. STUDENT EXPERIENCE

The Student interface should prioritize:

- Simplicity
- Engagement
- Clear navigation
- Game-like interaction
- Easy quiz participation
- Progress visibility
- Immediate feedback

The student gameplay experience must remain visually consistent with the original Orixa game.

---

# 13. QUIZ SYSTEM

Orixa's core gameplay is based around interactive quizzes and puzzle/reveal mechanics.

The fundamental gameplay concept is:

1. A covered image/puzzle is displayed.
2. The image is divided into tiles/pieces.
3. Each tile corresponds to a question.
4. Correct answers reveal/remove tiles.
5. The player progressively reveals the image.
6. Completing all questions reveals the complete image.
7. The player receives completion feedback.

Do not alter this fundamental gameplay concept unless explicitly instructed.

---

# 14. FRONTEND / BACKEND SEPARATION

When the project is in frontend-only development:

Do not introduce backend functionality.

Do not add:

- Database connections
- Authentication servers
- APIs
- Server-side logic
- JWT
- Production authentication

unless explicitly requested.

Use mock data when necessary.

When backend development begins, follow the architecture already established in the project.

---

# 15. DATA AND MOCK DATA

During frontend development:

Use realistic mock data.

Do not hardcode data into many unrelated components.

Keep mock data organized and reusable.

Make it easy to replace mock data with API data later.

---

# 16. AUTHENTICATION

Teacher and Student authentication are separate experiences.

Teacher authentication includes:

- Teacher Login
- Teacher Registration
- Teacher Dashboard

Student authentication will be developed separately.

During frontend-only development, authentication should be simulated.

Do not implement real authentication unless explicitly requested.

---

# 17. NAVIGATION

Navigation must be predictable.

Before removing or changing a route:

1. Search the project for references to it.
2. Check whether other components depend on it.
3. Update affected navigation.
4. Remove unused references.

Never leave broken links or dead navigation.

---

# 18. CODE QUALITY

Write clean, maintainable code.

Prefer:

- Clear naming
- Small reusable functions/components
- Minimal duplication
- Existing project conventions
- Logical file organization
- Simple solutions

Avoid:

- Unnecessary abstractions
- Massive components
- Duplicate logic
- Dead code
- Unused imports
- Unused dependencies
- Temporary hacks

---

# 19. DEPENDENCIES

Do not add a new dependency unless it is genuinely necessary.

Before adding a dependency:

1. Check whether the project already has an equivalent solution.
2. Prefer existing libraries.
3. Consider whether the dependency is necessary for the feature.

Do not introduce large frameworks or UI libraries just for a small feature.

---

# 20. FILE MODIFICATION RULE

Only modify files necessary for the requested feature.

Do not:

- Rewrite unrelated components
- Reformat the entire project unnecessarily
- Rename unrelated files
- Change unrelated styles
- Delete existing functionality

If a change requires modifying another file, verify that dependency before doing so.

---

# 21. BEFORE IMPLEMENTATION

For every task:

1. Inspect the relevant files.
2. Understand existing architecture.
3. Identify reusable components.
4. Identify existing styles.
5. Identify existing navigation.
6. Identify dependencies.
7. Create a concise implementation plan.

Do not immediately start rewriting code.

---

# 22. AFTER IMPLEMENTATION

Before declaring a task complete:

Check:

- Build succeeds
- No syntax errors
- No broken imports
- No obvious console errors
- Existing functionality still works
- New functionality works
- Responsive layout works
- Interactive elements work
- Navigation works
- No accidental visual regressions

---

# 23. TESTING

At minimum, verify:

Desktop:
- Large screen
- Standard laptop

Tablet:
- Medium-width screen

Mobile:
- Narrow screen

Also test:

- Buttons
- Forms
- Navigation
- Sidebar
- Modals
- Inputs
- Hover states
- Focus states
- Loading states
- Error states

---

# 24. GIT SAFETY

Do not overwrite or discard existing user work.

Do not reset the repository.

Do not force-push.

Do not delete branches.

Do not modify unrelated commits.

Keep changes isolated to the requested task.

Prefer working on a dedicated feature branch when the workflow allows it.

---

# 25. AI DEVELOPMENT RULES

AI agents must behave as software engineering assistants, not autonomous redesigners.

The user's explicit task takes priority.

If the requested feature conflicts with an existing Orixa rule, preserve the existing system unless the user explicitly asks to change it.

Do not invent additional features simply because they seem useful.

Do not expand the scope of a task unnecessarily.

---

# 26. WHEN REQUIREMENTS ARE AMBIGUOUS

If a requirement can be implemented safely using existing patterns, choose the existing project pattern.

If implementation would require a major architectural decision, stop and ask for clarification rather than making a large assumption.

Do not make irreversible architectural changes without explicit approval.

---

# 27. UI CHANGE RULE

When asked to change one visual element:

Change only that element and whatever is directly necessary to support it.

Do not redesign the entire page.

For example:

If asked to fix a button alignment:
→ Fix the button alignment.

Do not:
→ redesign the dashboard.

---

# 28. CURRENT DEVELOPMENT PHILOSOPHY

Orixa should be developed incrementally.

Preferred workflow:

Plan
→ Implement
→ Test
→ Review
→ Fix
→ Continue

Build one meaningful feature at a time.

Do not combine unrelated features into one implementation task.

---

# 29. FINAL PRINCIPLE

Every new feature should satisfy this question:

"Does this look and behave like it was designed as part of Orixa?"

If not, reuse the existing Orixa patterns before introducing something new.
