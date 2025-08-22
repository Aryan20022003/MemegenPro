export interface InternalContent {
  content: string;
  url: string;
}

export const INTERNAL_CONTENTS: InternalContent[] = [
  {
    content: `
    This Google's Greatest Hits & Misses Report for the first half of 2024 details several incidents and near-misses related to Google's service and infrastructure availability.
    Key Incidents & Takeaways
    Midas Metadata Outage: A misconfigured Server Authorization ACL caused a 1.5-hour outage in the Midas metadata system on June 14, 2024. This led to widespread task failures and SLO violations across multiple Google products. The incident highlighted the importance of carefully checking dependencies on global services and the non-atomic nature of Ganpati ACL changes.
    Power Monitoring Near Miss: On April 16, a user's command to decommission power monitoring for four server racks accidentally triggered the process for all of Google's server racks with designed power monitoring hardware—approximately 244,000 domains. The issue, which impacted over 161,000 server machines, was caused by an undocumented CLI flag and a client bug. Key lessons included the need for swift migrations, explicit rate limiting on mutating changes, and designing APIs that enforce explicit scope.
    Chiller Failure in a Datacenter: On June 5, a datacenter in Chandler, Arizona experienced a cooling failure due to faulty components in its chillers. This was a result of a faulty control card and an undersized refrigerant metering valve, which prevented the chillers from operating correctly in high ambient temperatures (108°F). The incident led to the power down of a cluster, impacting Cloud customers in the us-west8-c zone for nearly a week. The report emphasizes the need for better communication between the manufacturer and operations teams and for improved equipment validation for extreme conditions.
    `,
    url: 'https://g3doc.corp.google.com/company/teams/incident_management/outage_reports/ggh-newsletter.md?cl=head'
  },
  {
    content: `The report shares lessons from past incidents to help prevent future outages. It details both "hits" (major incidents with high external impact) and "misses" (potential major incidents that were successfully averted)`,
    url: 'https://g3doc.corp.google.com/company/teams/incident_management/outage_reports/ggh_archive/ggh-newsletter_2023Q4.md?cl=head'
  },
  {
    content: `Search experienced several small incidents where services deep within the request processing flow exhibited sharp increases in memory usage. This resulted in hundreds of task crashes and OOMs, all stemming from a single query. The underlying cause was an uncancellable  infinite RPC loop. Search's investment in layered defenses proved useful in detecting and mitigating this incident. While there was minimal user impact, had this escaped Search SRE watchful eye, it could have caused issues for Search.`,
    url: 'https://g3doc.corp.google.com/company/teams/incident_management/outage_reports/ggh_archive/ggh-newsletter_2023Q3.md?cl=head'
  },
  {
    content: `Google officially launched the Pixel 10 series on August 20, 2025, featuring the Pixel 10, Pixel 10 Pro, Pixel 10 Pro XL, and Pixel 10 Pro Fold, all powered by the Tensor G5 chip and packed with AI features from Google Gemini. Key highlights include a triple-camera system on all models, a redesigned hinge for the foldable, and a new emphasis on AI integration with features like Magic Cue. The devices are now available, with pricing starting at Rs 79,999 for the standard Pixel 10.`,
    url: 'https://blog.google/products/pixel/google-pixel-10-pro-xl/#moderndesign'
  }
];