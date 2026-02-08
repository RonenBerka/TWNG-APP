---
name: ecommerce-conversion-optimizer
description: Analyze e-commerce websites and provide data-driven recommendations to improve conversion rates and sales performance. Use when the user needs to (1) analyze product pages for conversion optimization, (2) identify barriers in the checkout process, (3) generate A/B test ideas for homepage or landing pages, (4) review user experience and sales funnel effectiveness, or (5) provide strategic recommendations for increasing online sales for jewelry, luxury goods, or other e-commerce sites.
---

## 📅 Dynamic Context

**Analysis Date**: !`date '+%d %B %Y'`
**Current Quarter**: !`date '+Q'$(date '+%-m' | awk '{print int(($1-1)/3)+1}')' +' of %Y'`
**Benchmark Period**: !`date '+%B %Y'` - !`date -d 'next month' '+%B %Y'`

---

# E-commerce Conversion Optimization

Provide comprehensive, actionable analysis and recommendations to improve e-commerce conversion rates based on industry best practices and conversion rate optimization (CRO) principles.

## Core Analysis Framework

When analyzing e-commerce sites, evaluate across these key dimensions:

### 1. Product Page Optimization
- **Visual hierarchy**: Hero image quality, gallery functionality, zoom capabilities
- **Product information**: Title clarity, description completeness, technical specs, materials
- **Social proof**: Reviews, ratings, testimonials, trust badges
- **Pricing strategy**: Price visibility, discount presentation, urgency indicators
- **CTA optimization**: Button placement, color, copy, visibility
- **Mobile responsiveness**: Touch targets, image loading, layout adaptation

### 2. Checkout Process Analysis
- **Friction points**: Required fields, account creation requirements, form complexity
- **Progress indicators**: Step visibility, completion percentage
- **Payment options**: Method variety, security signals, mobile wallet integration
- **Error handling**: Validation clarity, error messaging
- **Guest checkout**: Availability and ease of use
- **Cart abandonment triggers**: Unexpected costs, shipping info timing, trust signals

### 3. Homepage & Landing Pages
- **Value proposition**: Clarity, uniqueness, immediate visibility
- **Navigation**: Intuitive structure, search functionality, category organization
- **Above-the-fold content**: Hero section effectiveness, CTA prominence
- **Content hierarchy**: Logical flow, visual breaks, scanning optimization
- **Loading speed**: Image optimization, resource loading priorities

### 4. User Experience Elements
- **Trust indicators**: Security badges, return policy, contact information
- **Search & filtering**: Functionality, accuracy, filter options
- **Site speed**: Page load times, interaction responsiveness
- **Mobile experience**: Touch-friendly, responsive design, mobile-specific features
- **Accessibility**: Alt text, contrast, keyboard navigation

## Output Guidelines

### For Page Analysis Requests
Provide:
1. **Executive Summary** (2-3 sentences on overall performance)
2. **Critical Issues** (top 3-5 high-impact problems)
3. **Quick Wins** (easily implementable improvements)
4. **Strategic Recommendations** (longer-term enhancements)
5. **Priority Matrix** (impact vs. effort for each recommendation)

### For A/B Test Ideas
Provide:
1. **Test Hypothesis** (what you're testing and expected outcome)
2. **Test Variations** (A and B descriptions)
3. **Success Metrics** (what to measure)
4. **Implementation Notes** (technical considerations)
5. **Estimated Impact** (low/medium/high potential)

### For Checkout Analysis
Provide:
1. **Funnel Step Breakdown** (analyze each step)
2. **Friction Point Identification** (specific barriers)
3. **Abandonment Risk Factors** (elements likely causing drop-off)
4. **Recommended Flow** (optimized checkout sequence)
5. **Form Optimization** (field reduction, autofill, validation improvements)

## Industry-Specific Considerations

### Jewelry & Luxury E-commerce
- High-resolution imagery with 360° views or video essential
- Detailed product specifications (materials, dimensions, weight)
- Certificate/authenticity documentation
- Gift packaging and personalization options
- Higher trust barrier requires stronger social proof
- Extended product descriptions emphasizing craftsmanship
- Lifestyle imagery showing products in use

### Israeli Market Specifics
- Hebrew language optimization (RTL considerations)
- Local payment methods (Bit, Israeli credit cards)
- Shipping expectations (fast domestic delivery)
- Cultural holidays and gift-giving occasions
- VAT display and pricing transparency
- Local trust signals (Israeli business registration, local address)

## Best Practices Reference

### Conversion Rate Benchmarks
- Average e-commerce conversion: 2-4%
- **Jewelry & luxury e-commerce: 0.9-1.3%** (lowest conversion rate industry)
- Mobile conversion typically 50-70% of desktop

**Note**: Jewelry has the lowest conversion rates due to high price points and longer consideration periods.

### Critical Performance Indicators
- Page load time: Target <3 seconds
- Add-to-cart rate: Industry avg 8-10%
- Cart abandonment: Industry avg 70-74% (jewelry: 80-82%)
- Mobile traffic: Typically 60-70% of total

**Note**: Jewelry and luxury goods have the highest cart abandonment rates (80-82%) among all e-commerce sectors.

### Common High-Impact Optimizations
1. Add customer reviews (can increase conversion by 18-34%)
2. Improve product images (increase conversion by 9-40%)
3. Simplify checkout (reduce steps can increase conversion by 35%)
4. Add live chat (can increase conversion by 20%)
5. Display security badges (increase conversion by 19%)
6. Optimize mobile experience (70% of traffic, higher abandonment)

## Analysis Approach

When provided with site information:
1. Start with user journey perspective (discovery → consideration → purchase)
2. Identify conversion blockers at each stage
3. Prioritize recommendations by impact and implementation effort
4. Provide specific, actionable suggestions with examples
5. Reference industry benchmarks where relevant
6. Consider device-specific experiences (mobile vs desktop)
7. Balance aesthetic preferences with conversion optimization

Tailor recommendations to the specific business context, target audience, and product type while maintaining focus on measurable conversion improvements.
