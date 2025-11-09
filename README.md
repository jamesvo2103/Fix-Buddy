**Inspiration**
------------------------------------------
When people talk about environmental problems, most focus on the carbon footprint. But another major issue is the amount of waste that ends up in landfills. Every day, people throw away broken household items that could easily be repaired with a little guidance. We built FixBuddy to help change that, a tool that helps users diagnose what’s wrong with an item and learn how to fix it themselves, instead of tossing it away.


**What it does**
------------------------------------------
FixBuddy is an AI-powered web app that helps users diagnose and fix broken household items on their own. Here’s how it works:
User Input: The user uploads a photo of the broken item and provides a short text description of what’s wrong.
AI Diagnosis: The first agent analyzes the image and description to identify the item and understand the likely issue. It then determines whether the item is safe for the user to handle.
Repair Guidance: If it’s safe, a second AI agent generates a set of clear, step-by-step instructions on how to fix it, tailored to the user’s experience level.
Tutorials and Tools: FixBuddy also recommends relevant YouTube tutorials and lists the tools needed for the repair.
Over time, the system learns from user interactions. For example, someone who marks themselves as a beginner will get simpler steps and easier tutorials, while an advanced user might get more detailed or technical instructions. The goal is to make DIY repairs as intuitive and safe as possible for everyone.


**DEMO**
------------------------------------------
![FixBuddy Demo](./demo.gif)


**How we built it**
------------------------------------------
Frontend: React.js, Taildwind CSS
Backend: Node.js, MongoDB
AI Integration: Gemini API, Youtube Data API, Langchain, Multi AI Agents 

**Challange we ran into**
------------------------------------------
Identifying an item and providing accurate repair guidance turned out to be a much more complicated task than we initially expected. When we first tried using a single AI model to handle both diagnosis and instruction, the results were inconsistent. The model often mixed the two steps together, sometimes it would start generating repair steps before fully understanding the problem, and other times it would misidentify what the user was trying to fix entirely.
To solve this, we decided to split the process into two separate AI agents. The first agent focuses only on understanding what the item is, what might be wrong with it, and whether it’s safe to repair. The second agent then takes that information and focuses solely on producing the actual repair instructions. 

**What's next**
------------------------------------------
Our next step is to deploy FixBuddy on a cloud platform so that anyone can access it from their phone or computer. Once deployed, users will be able to take photos directly from their camera and send them straight to the AI agents for processing, making the experience faster and more convenient.
We also plan to improve the AI workflow to make results more consistent and accurate. While the current two-agent setup works well, performance can vary depending on image quality or how the issue is described. Refining how the agents share context and interpret inputs will help ensure that FixBuddy delivers reliable, step-by-step repair guidance every time.
