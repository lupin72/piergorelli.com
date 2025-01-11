---
title: 'Is it still worth developing on WordPress in 2025?'
pubDate: 2025-01-11
description: 'Is WordPress still worth it in 2025? Explore its relevance, technical viability, alternatives like Laravel, JamStack, and the rise of Drupal CMS.'
author: 'Pier Gorelli'
cover: "./images/wordpress.jpg"
alt: 'Wordpress'
tags: ["wordpress", "development"]
---
The start of a new year is always a great time to ask big questions and set new goals: hitting the gym, working on that side project that’s been gathering dust in a drawer, or, why not, considering whether WordPress is still the right choice for your projects.

A quick disclaimer: this isn’t a post to stir up controversy. In fact, it’s 2025, and I’m actively working on a WordPress project. But the question remains crucial—not just for developers who constantly evaluate their tools, but for anyone using WordPress, especially in the wake of the controversial **WP-Engine Gate**.

---

## The Automattic–WP Engine clash

Things escalated in mid-September when Matt Mullenweg, WordPress founder and CEO of Automattic, published a [controversial post](https://wordpress.org/news/2024/09/wp-engine/) on Wordpress.org, labeling WP Engine as "a cancer for WordPress." Mullenweg accused WP Engine of exploiting the WordPress brand for financial gain and deliberately misleading customers into thinking it was part of the WordPress ecosystem.

WP Engine quickly pushed back, denying the allegations and claiming that its practices complied with community standards. The conflict peaked on October 12, when **WordPress.org took control of Advanced Custom Fields (ACF)**, a popular plugin owned by WP Engine, rebranding it as **Secure Custom Fields (SCF)** over security concerns. At the same time, WP Engine was banned from the official plugin repository.

---

## The community's reaction

The community was deeply divided. On one side, many supported Mullenweg, arguing that drastic measures were necessary to protect the integrity of the WordPress brand. On the other, some questioned the level of control a single individual wields over a platform that powers **40% of the web** and dominates **60% of the CMS market**.

The fallout also hit Automattic hard: **159 developers and engineers**, 80% of whom were directly involved in WordPress development, resigned from the company. Many cited disagreements with Mullenweg’s vision and actions, both from technical and ethical perspectives.

---

## Trust and governance under scrutiny

This controversy shone a spotlight on structural issues in WordPress’s governance. While Automattic has played a critical role in WordPress’s success, Mullenweg’s centralized control has raised questions about whether WordPress truly operates as an independent open-source project.

**Joost de Valk**, founder of Yoast, proposed a [solution](https://techcrunch.com/2024/12/23/yoasts-former-ceo-calls-for-a-federated-approach-to-wordpress-repository/): creating an independent foundation governed by a council of community members and stakeholders from diverse sectors. This foundation would oversee **WordPress.org** and its assets, fostering a leadership model that’s more inclusive and representative of the project’s core values of democratization.

---

## Is WordPress still technically viable?

Beyond the governance debate, a bigger question looms: **Is WordPress still a technically sound choice?**

WordPress was born 20 years ago as a blogging platform, disrupting a CMS market that was dominated by complex tools like Joomla and Mambo. Its defining trait? **Simplicity.** A user-friendly interface, fast installation, a growing ecosystem of plugins and themes, and a system of **hooks** that made extending its functionality easy. With just a few lines in `functions.php` (the (in)famous "just copy and paste in your functions.php"), you could tweak your site without breaking a sweat.

Over the years, WordPress has evolved to meet new demands, introducing features like the **REST API** for headless setups and **Gutenberg**, which has made no-code content creation more accessible. However, these updates haven’t fundamentally changed its architecture, which still prioritizes backward compatibility. This approach has cemented WordPress’s dominance, powering over **40% of the web** and capturing **60% of the CMS market**.

But the real question isn’t, **“Can you use WordPress?”** It’s, **“Is WordPress the best choice?”** Being a "universal" platform doesn’t always make it the most efficient option.

For example:
- **Laravel** and **Drupal** offer a modern architecture, advanced scalability, and the flexibility required for complex applications.
- **JamStack** (Astro, Next.js) excels at static sites, providing blazing-fast performance and an outstanding **developer experience** by decoupling content and frontend.

Sure, you *could* move house with a LIDL shopping cart because it has wheels. But is it the smart choice? **Spoiler: no.** (And yes, I’ve learned this the hard way. 😅)

---

## WordPress and modern best practices: the Roots stack

A promising middle ground combines WordPress’s strengths with **modern development practices**. The **[Roots community](https://roots.io/)** has reimagined WordPress with tools like **Sage**, **Trellis**, **Acorn** and **Bud**, significantly improving the **developer experience**. This stack introduces:
- **Laravel and Blade** for templating.
- **Block editor with Hot Module Replacement (HMR).**
- **Automated, secure deployments** with configuration splitting.
- **Advanced caching** powered by Laravel.
- **Enhanced production security** with stricter settings.
- A **modern file structure**, eliminating the outdated `functions.php` approach.

For medium-scale projects, this setup elevates WordPress into a competitive, flexible platform that emphasizes **reusability**, **maintainability**, and **testability**.

---

## New developments: Drupal CMS for marketers and designers

In the coming days, Drupal will unveil **[Drupal CMS](https://new.drupal.org/drupal-cms)**, a version tailored for non-technical users like marketers and content creators. Featuring an intuitive interface and advanced visual tools, this iteration aims to dispel the myth that "Drupal is hard," expanding its audience while preserving the robust capabilities demanded by developers and enterprises.

This strategic release offers an appealing alternative for those considering a migration from WordPress. The new CMS keeps Drupal’s core power but introduces:
- A user-friendly installation process.
- Pre-configured solutions and a sophisticated site-building toolkit.
- Advanced SEO tools.
- AI-powered features for complex workflows.

---

## Conclusion

WordPress is still a valid choice, but it’s no longer the default answer for every project. As the tech landscape evolves, selecting the right platform depends on the project’s unique requirements. **2025 will be a defining year for WordPress**: staying relevant will require both technological innovation and governance reforms to secure its future. Choosing WordPress in 2025 means weighing your team’s expertise, the project’s needs, and the platform’s potential for growth.
