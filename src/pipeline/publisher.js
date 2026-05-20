// publisher.js - Product publishing workflow
// Handles the handoff from approved candidate to storefront

export class ProductPublisher {
  constructor(options = {}) {
    this.storefrontUrl = options.storefrontUrl || '';
    this.adminEmail = options.adminEmail || '';
    this.autoPublish = options.autoPublish || false;
    this.approvalThreshold = options.approvalThreshold || 75;
  }

  /**
   * Evaluate a product for publishing readiness
   */
  evaluate(product) {
    const checks = {
      hasName: !!product.name,
      hasPrice: typeof product.price === 'number' && product.price > 0,
      hasCategory: !!product.category,
      hasImage: !!product.imageUrl,
      hasDescription: !!product.description && product.description.length > 20,
      meetsMarginThreshold: product.price && product.cost
        ? ((product.price - product.cost) / product.price) > 0.3
        : false,
      passesScoring: product.trendScore >= this.approvalThreshold,
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.values(checks).length;
    const ready = passed === total;

    return {
      checks,
      passed,
      total,
      ready,
      missingFields: Object.keys(checks).filter((k) => !checks[k]),
    };
  }

  /**
   * Generate a product listing draft
   */
  generateDraft(product) {
    return {
      title: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.originalPrice || null,
      category: product.category,
      tags: product.tags || [],
      images: product.imageUrl ? [{ src: product.imageUrl }] : [],
      status: 'draft',
      source: product.source,
      sourceUrl: product.sourceUrl,
      trendScore: product.trendScore,
      approvedAt: new Date().toISOString(),
    };
  }

  /**
   * Send approval notification
   */
  async notify(product, evaluation) {
    // In production: send email via SendGrid/Postmark
    console.log(`[Publisher] Product ready for review: ${product.name}`);
    console.log(`[Publisher] Score: ${product.trendScore}/100`);
    console.log(`[Publisher] Missing: ${evaluation.missingFields.join(', ') || 'none'}`);

    return {
      sent: true,
      to: this.adminEmail,
      product: product.name,
      evaluation,
    };
  }
}

export function formatProductForStore(product) {
  return {
    id: product.id || `prod_${Date.now()}`,
    title: product.name,
    body_html: `<p>${product.description || ''}</p>`,
    vendor: 'SunMoonOcean',
    product_type: product.category,
    tags: (product.tags || []).join(','),
    variants: [
      {
        price: (product.price || 0).toFixed(2),
        inventory_management: 'none',
        inventory_policy: 'continue',
      },
    ],
    images: product.imageUrl ? [{ src: product.imageUrl }] : [],
  };
}