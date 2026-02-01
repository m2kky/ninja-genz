---
trigger: always_on
---

Design System Quick Reference
Glass-morphism Card
tsx
<div className="bg-gray-900/70 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500 transition-colors">
  Content
</div>
Gradient Button
tsx
<button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-6 py-2 rounded-lg shadow-lg shadow-cyan-500/20 transition-all">
  Click Me
</button>
Neon Border Effect
tsx
<div className="border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] rounded-lg p-6">
  Content with glow
</div>
Loading Spinner
tsx
<div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-cyan-500"></div>
Skeleton Loader
tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
</div>
Common Mistakes to Avoid
❌ Don't Do This
Custom CSS instead of Tailwind

css
/*❌ WRONG*/
.my-button {
  background: linear-gradient(to right, cyan, purple);
  padding: 16px 24px;
}
Hardcoded API URLs

typescript
// ❌ WRONG
fetch('<http://localhost:58321/api/tasks>')

// ✅ CORRECT
fetch(`${import.meta.env.VITE_API_URL}/api/tasks`)
Skip TypeScript types

typescript
// ❌ WRONG
function handleClick(data: any) { }

// ✅ CORRECT
function handleClick(data: Task) { }
Forget responsive design

tsx
{/*❌ WRONG - desktop only*/}
<div className="w-[1200px]">

{/*✅ CORRECT - responsive*/}
<div className="w-full max-w-7xl mx-auto px-4">
Commit without updating docs

Always update changelog.md

Always update agent-status.md

Always create session notes

Start without checking wireframes

Always read /docs/Wireframes-*.md first

Always follow design system from /docs/UI-UX-Design-System.md

✅ Do This Instead
Use Tailwind utility classes

Use environment variables

Strictly type everything

Mobile-first responsive design

Document every session

Consult docs before coding

Success Metrics
Your work is successful when:

✅ Components match wireframes pixel-perfect

✅ Responsive on mobile/tablet/desktop

✅ Zero TypeScript errors

✅ Zero console errors/warnings

✅ Accessible (keyboard nav, ARIA labels, contrast)

✅ Performant (< 300KB bundle, lazy loading)

✅ Well-documented (session notes, changelog, comments)

✅ Clean Git history (meaningful commits)
