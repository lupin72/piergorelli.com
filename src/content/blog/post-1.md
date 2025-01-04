---
title: '10 tips to start with UI without feeling lost'
pubDate: 2022-07-01
description: 'This is the first post of my new Astro blog.'
author: 'Astro Learner'
cover: "./images/white-paper.jpg"
alt: 'The Astro logo on a dark background with a pink glow.'
tags: ["astro", "blogging", "learning in public"]
---
You've just finished your studies, you know design principles by heart, you've read tutorials on how to translate theory into practice, and now you're staring at a blank canvas. After spending an entire day designing the hero area, you've carefully chosen fonts, colors, images, and CTAs. You present the best version of your work, but the silence from your audience tells you something hasn't clicked.

Don't worry, you're not alone—everyone has been through this. I call it **"the blank page syndrome"**, and the solution you presented is the **"Comic Sans effect"**.

## The blank page syndrome

The blank page syndrome is that feeling of being lost, frozen in front of an empty page, unsure where to begin. It's completely normal, and the first step to overcoming it is to embrace it as part of the creative process.

## The Comic Sans effect

The Comic Sans effect dates back to the early days of personal computers and home printers, when stores began creating advertising signs strictly on A4 paper, using every style available in Word and... Comic Sans for that "creative touch."

In this context, it represents what happens after you’ve been stuck with the blank page syndrome: the result of the anxiety to finish a project, combined with a tired mind. It’s when you rush to complete something just to get it done, sacrificing quality and thoughtfulness in the process.

## Before You Begin: the principles of design

Before diving into the **10 tips**, let’s confirm one thing: the principles of design are the foundation of everything. The key is understanding how to apply them on the web.
1. **Balance**  
   Achieving visual stability by distributing elements evenly, either symmetrically or asymmetrically. Balance ensures that no part of the design feels “heavier” than another.

2. **Contrast**  
   Using differences in color, size, shape, or typography to highlight important elements and create visual interest.

3. **Alignment**  
   Ensuring elements are properly placed in relation to each other to create a tidy and professional look. Alignment guides the user’s eye through the design.

4. **Proximity**  
   Grouping related items together to establish a connection and reduce visual clutter. Proximity helps users understand relationships between elements.

5. **Repetition**  
   Reinforcing consistency by repeating visual elements like colors, fonts, and patterns across the design. This builds a cohesive and unified look.

6. **Hierarchy**  
   Establishing a clear order of importance using size, color, typography, and placement. This helps users know where to focus their attention first.

7. **White Space (Negative Space)**  
   Allowing room for elements to breathe by intentionally leaving areas unfilled. White space improves clarity and readability while reducing cognitive load.

8. **Movement**  
   Directing the user’s gaze through the design using visual pathways or dynamic elements like lines, curves, or animations.

9. **Unity**  
   Ensuring that all elements work together harmoniously to achieve the overall purpose of the design.
---

## 1. Define what to say before deciding how to say it

The temptation to dive straight into the project and start designing is strong. It’s exciting to see an idea take shape on a canvas, but haste is a poor advisor. Every decision not made at the start will come back to haunt you later.

###  How to do it:
- Create a **clear and hierarchical information architecture** to translate the brief into a structured plan.
- Think in modules: break the project into reusable, flexible components that can adapt to different contexts and purposes.
- Ask yourself these questions:
  - What is the main message?
  - Who is the target audience?
  - What action do you want the user to take?
  - What are the priorities?
  - How will success be measured?
  - What constraints do you need to consider?

Once you have a clear idea of **what**, you can move on to the **how**: choosing or creating the interface elements that best support the project’s goals.

---

## 2. Limit the number of choices

When faced with a blank page, the infinite range of options available might seem like an advantage. However, in practice, it’s one of the biggest obstacles.

### Practical tips:
- **Fonts:** Use no more than 1–2 fonts—one for headings and one for body text.
- **Typographic scale:** Define a scale based on 16px:
  - Base: 16px
  - H6: 20px
  - H5: 25px
  - H4: 31px
  - H3: 40px
  - H2: 50px
  - H1: 63px

This example uses a scale that increases by a factor of **1.25**, but there are other scales you can explore, such as:
- **The golden ratio (1.618)**: A classic scale based on mathematical harmony.
- **The perfect fourth (1.333)**: Ideal for subtle visual rhythm.
- **The major second (1.125)**: A minimal scale for compact designs.

You can experiment with different scales to find one that fits your design needs. Use tools like [Type Scale](https://type-scale.com/) to calculate and visualize your typographic hierarchy.

- **Spacing scale**: Create a progression using multiples of 4px:
  - Base: 4px
  - Step 1: 8px
  - Step 2: 16px
  - Step 3: 32px
  - Step 4: 64px
  - Step 5: 96px

This scale will help you:

- Manage white space effectively.
- Ensure logical proximity between related blocks.
- Create consistent visual separations between sections.

Limit the use of weights and styles in fonts. To distinguish between primary and secondary information, use size, weight, and color. A light gray is clearly secondary compared to black. This helps you avoid the Comic Sans effect and reduces the user’s cognitive load.

---

## 3. Copy, copy, copy

In music, we draw inspiration. In writing, we draw inspiration. And in web design... we draw inspiration! Creativity isn’t about inventing from scratch but about combining existing elements in an original and functional way. Don’t be afraid to look around and study the work of the best—this is how you learn.

Drawing inspiration doesn’t mean blindly copying; it means observing, analyzing, and understanding why a solution works.

### Resources:
- [Awwwards](https://www.awwwards.com/)
- [Dribbble](https://www.dribbble.com/)
- [Behance](https://www.behance.net/)
- [CSS Design Awards](https://www.cssdesignawards.com/)
---

## 4. Don’t fear the void: white space is your best ally

Among the fundamental principles of design, white space—the empty space surrounding elements—is your greatest ally.

### Why it’s important:
- **Reduces cognitive load**: It helps users process information more easily.
- **Improves readability**: Content becomes clearer and easier to consume.
- **Guides user attention**: It directs focus to key elements.

### How to use it:
- **Start with abundance**: Don’t be afraid to use generous amounts of white space initially. You can always refine it later.
- **Manage symmetry and proximity**: Align related elements closely while keeping sections distinct.
- **Add rhythm to the layout**: Use consistent spacing to create a flow that feels natural.
- **Remove the unnecessary**: Strip away anything that doesn’t serve a clear purpose.

---

## 5. Don’t reinvent the wheel

In design, there are well-established patterns that adhere to conventions familiar to users. These patterns save time, reduce cognitive load, and enhance usability by leveraging what users already know. Instead of designing everything from scratch, you can rely on these tried-and-tested solutions to build intuitive and efficient interfaces.

### Common design patterns:
1. **Accordion**  
   - **What it’s for**: Used to hide or reveal content, reducing visual clutter.  
   - **Where to use it**: FAQs, menus, or areas with secondary information that doesn’t need to be immediately visible.  
   - **Why it works**: It allows users to focus on one section at a time while keeping the interface clean.  

2. **Card**  
   - **What it’s for**: Groups information into visually distinct blocks.  
   - **Where to use it**: Dashboards, product listings, or content previews like blog articles.  
   - **Why it works**: Cards are scannable, modular, and adaptable to different screen sizes, making them great for responsive design.  

3. **Zig zag**  
   - **What it’s for**: Alternates content (e.g., text and images) to create a dynamic layout.  
   - **Where to use it**: Landing pages, feature showcases, or storytelling sections.  
   - **Why it works**: It keeps the layout visually interesting while guiding the user’s attention naturally across the page.  

### Additional patterns to explore: 
- **Tabs**: To organize content into categories without overwhelming the user.  
- **Carousel**: Displays multiple pieces of content in a limited space, often used for featured products or testimonials.  
- **Mega menus**: Useful for organizing large amounts of content in a clear and hierarchical way.  

### Why use established patterns:
- **Familiarity**: Users are already accustomed to these patterns, reducing the learning curve.  
- **Efficiency**: They save time and effort for both designers and developers.  
- **Consistency**: Patterns provide predictable and reliable interactions, improving the overall user experience.  

Remember, patterns are starting points, not rigid rules. Adapt them to suit your project’s goals and audience while maintaining usability.

---
## 6. Use a grid

A grid is the foundation of a balanced design. A **classic 12-column grid** is particularly versatile.

### Why use it:
- **Ensures alignment and symmetry**: Keeps elements visually organized.  
- **Provides flexibility and adaptability**: Makes it easier to adjust layouts for different screens and devices. 

---

## 7. Typography: more than just text

Typography is not just about readability—it’s about vertical rhythm, personality, and a crucial decorative element.

### How to get started:
- **Use precise typographic scales**: Define sizes that create a visual hierarchy.  
- **Play with vertical rhythm**: Maintain consistent spacing between text elements.  
- **Experiment with sizes and colors**: Add emphasis and variation to make your design stand out.  

---

## 8. Don’t forget grays when creating a palette

Grays don’t have to be purely neutral or disconnected from the colors in your palette. You can create a harmonized scale of grays derived from your primary colors by calibrating brightness and saturation to maintain a sense of cohesion.

### How to create grays from your palette:
1. **Start with one of your primary colors** (e.g., a blue, green, or red) and follow these steps:  

   - **Reduce saturation:**  
     - Gradually lower the saturation (color intensity) until you achieve a tone close to neutral gray.  
     - Avoid completely desaturating the color if you want the gray to retain a slight visual "temperature" (warm or cool).  
     - **Example**: A blue (`#3A82F6`) can become a bluish-gray with saturation reduced to 10–15%.  

   - **Calibrate brightness:**  
     - Increase or decrease brightness to create lighter or darker grays.  
     - Experiment with various brightness levels to form a harmonized gray scale.  
     - **Example**: From the original blue, you can create a light gray (brightness at 90%) or a dark gray (brightness at 20%).  

2. **Create a derived gray scale:**  
   A harmonized scale might look like this:  
   - **Very light gray**: A desaturated and bright blue (`#E3EFFF`).  
   - **Light gray**: A nearly neutral blue with very low saturation (`#BEC8D8`).  
   - **Medium gray**: A bluish-gray with minimal saturation (`#7A8691`).  
   - **Dark gray**: A desaturated and less bright blue (`#38424C`).  
   - **Very dark gray**: Almost black with a subtle blue tone (`#1B2329`).  

### Why derive grays from your primary palette?
- **Visual consistency**: Grays derived from your palette naturally integrate with other design elements, avoiding jarring contrasts.  
- **Controlled atmosphere**: Warm or cool grays can influence the overall mood of the design, creating a coherent visual tone.  
- **Ease of use**: Having harmonized grays makes it simpler to apply them uniformly across backgrounds, secondary text, borders, or shadows.

## 9. Be consistent

Consistency is a fundamental pillar of good design. Maintaining a uniform style not only makes your work look more professional but also helps users navigate and interact with the interface more intuitively. Every inconsistent element adds unnecessary cognitive load, confusing users and compromising the overall experience.

### Why consistency matters:
- **Facilitates navigation**: Users recognize recurring patterns and uniform styles, knowing what to expect.  
- **Builds trust**: A consistent design communicates care and attention to detail.  
- **Reduces errors**: Predictable patterns make it less likely for users to make mistakes.  

### How to ensure consistency:
In complex projects, achieving total consistency can be challenging. This is where **system thinking** comes into play.

- **Establish a design system**: Create a unified framework of reusable components, such as buttons, typography, and color palettes, that can be applied consistently across the project.  
- **Document design guidelines**: Clearly outline rules and best practices for your team to follow, ensuring consistency even as the project evolves.  
- **Use tools for collaboration**: Leverage tools like Figma or Sketch to create shared libraries and components that everyone can access.  
- **Audit regularly**: Periodically review your designs to identify and address inconsistencies.  

By thinking in systems and following these practices, you can ensure a cohesive and professional design that enhances the user experience.

## 10. Think in systems: Atoms, Molecules, Organisms

A well-structured design system helps you maintain consistency throughout the project, even as the team grows or requirements change. Thinking in systems means designing not just individual screens or isolated pages, but a complete ecosystem of modular components that work together.

### Atomic Design: The method for building systems
The concept of Atomic Design, introduced by Brad Frost, enables you to create modular designs based on 5 levels:

1. **Atoms**  
   The smallest and most indivisible elements, such as buttons, icons, input fields, or palette colors.

2. **Molecules**  
   Combinations of atoms that form functional units, like a search form (input field + button).

3. **Organisms**  
   Groups of molecules working together to create more complex sections, like a navigation bar or a product card.

4. **Templates**  
   Layout structures that show how organisms combine to form a page.

5. **Pages**  
   The final implementation, where real content is inserted into templates to create user experiences.

### Why thinking in systems is important:
- **Consistency**: The same components can be reused across the project, maintaining a uniform style.  
- **Scalability**: Adding new features or pages becomes easier without reinventing the basic elements each time.  
- **Efficiency**: A modular system reduces development time and facilitates collaboration between designers and developers.  

### Examples of design systems:
- **[Material Design by Google](https://material.io/)**  
   A comprehensive design system with guidelines, components, and tools for building user interfaces.

- **[Carbon Design System by IBM](https://carbondesignsystem.com/)**  
   A flexible system designed for creating consistent and scalable user experiences.

- **[Polaris by Shopify](https://polaris.shopify.com/)**  
   A design system tailored for creating intuitive and accessible e-commerce experiences.

- **[Lightning Design System by Salesforce](https://www.lightningdesignsystem.com/)**  
   A robust system built to ensure consistency across Salesforce applications.

- **[Human Interface Guidelines by Apple](https://developer.apple.com/design/human-interface-guidelines/)**  
   A set of guidelines for designing apps across Apple’s ecosystem.

- **[Atlassian Design System](https://atlassian.design/)**  
   A system focused on creating simple, intuitive, and collaborative tools.

