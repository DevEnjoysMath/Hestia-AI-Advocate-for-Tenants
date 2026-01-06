/**
 * Export analysis results as a formatted text file (PDF export would require a library like jsPDF)
 * For now, we'll create a well-formatted text document that can be saved or printed
 */

interface KeyTerms {
  [key: string]: string | undefined;
}

interface Alert {
  rule_id: string;
  title: string;
  explanation: string;
  severity: string;
  recommendation: string;
  legal_url?: string;
}

interface MissingClause {
  rule_id: string;
  title: string;
  explanation: string;
  severity: string;
  recommendation: string;
  legal_url?: string;
}

interface GoodToKnow {
  title: string;
  explanation: string;
}

interface AnalysisResult {
  key_terms: KeyTerms;
  alerts: Alert[];
  missing_clauses?: MissingClause[];
  good_to_know: GoodToKnow[];
}

export function exportAnalysisAsText(result: AnalysisResult): void {
  const lines: string[] = [];

  // Header
  lines.push('================================================================================');
  lines.push('                        HESTIA LEASE ANALYSIS REPORT');
  lines.push('                     AI-Powered Tenant Advocacy Platform');
  lines.push('================================================================================');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString('en-IE', {
    dateStyle: 'full',
    timeStyle: 'short'
  })}`);
  lines.push('');
  lines.push('DISCLAIMER: This report is for informational purposes only and does not');
  lines.push('constitute legal advice. For specific legal matters, please consult with');
  lines.push('a qualified legal professional or contact the Residential Tenancies Board.');
  lines.push('');
  lines.push('================================================================================');
  lines.push('');

  // Key Terms
  lines.push('KEY TERMS');
  lines.push('--------------------------------------------------------------------------------');
  if (Object.keys(result.key_terms).length > 0) {
    Object.entries(result.key_terms).forEach(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      lines.push(`${label}: ${value}`);
    });
  } else {
    lines.push('No key terms extracted.');
  }
  lines.push('');
  lines.push('================================================================================');
  lines.push('');

  // Alerts
  lines.push('LEGAL INSIGHTS');
  lines.push('--------------------------------------------------------------------------------');
  if (result.alerts.length > 0) {
    result.alerts.forEach((alert, index) => {
      lines.push(`${index + 1}. ${alert.title}`);
      lines.push(`   Severity: ${alert.severity}`);
      lines.push(`   Reference: ${alert.rule_id}`);
      lines.push('');
      lines.push(`   ${alert.explanation}`);
      lines.push('');
      if (alert.recommendation) {
        lines.push(`   RECOMMENDED ACTION:`);
        lines.push(`   ${alert.recommendation}`);
        lines.push('');
      }
      if (alert.legal_url) {
        lines.push(`   Legal Source: ${alert.legal_url}`);
        lines.push('');
      }
      lines.push('   ' + '-'.repeat(74));
      lines.push('');
    });
  } else {
    lines.push('No issues found. Your lease appears to comply with Irish tenancy laws.');
    lines.push('');
  }
  lines.push('================================================================================');
  lines.push('');

  // Missing Clauses
  if (result.missing_clauses && result.missing_clauses.length > 0) {
    lines.push('MISSING CLAUSES');
    lines.push('--------------------------------------------------------------------------------');
    result.missing_clauses.forEach((clause, index) => {
      lines.push(`${index + 1}. ${clause.title}`);
      lines.push(`   Severity: ${clause.severity}`);
      lines.push(`   Reference: ${clause.rule_id}`);
      lines.push('');
      lines.push(`   ${clause.explanation}`);
      lines.push('');
      if (clause.recommendation) {
        lines.push(`   RECOMMENDED ACTION:`);
        lines.push(`   ${clause.recommendation}`);
        lines.push('');
      }
      if (clause.legal_url) {
        lines.push(`   Legal Source: ${clause.legal_url}`);
        lines.push('');
      }
      lines.push('   ' + '-'.repeat(74));
      lines.push('');
    });
    lines.push('================================================================================');
    lines.push('');
  }

  // Good to Know
  if (result.good_to_know.length > 0) {
    lines.push('GOOD TO KNOW');
    lines.push('--------------------------------------------------------------------------------');
    result.good_to_know.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title}`);
      lines.push('');
      lines.push(`   ${item.explanation}`);
      lines.push('');
      lines.push('   ' + '-'.repeat(74));
      lines.push('');
    });
    lines.push('================================================================================');
    lines.push('');
  }

  // Footer
  lines.push('');
  lines.push('NEXT STEPS');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('1. Review all highlighted issues with your landlord');
  lines.push('2. Request clarification or amendments to problematic clauses');
  lines.push('3. Keep this report for your records');
  lines.push('4. Contact the RTB if issues cannot be resolved: www.rtb.ie');
  lines.push('5. Seek legal advice for complex matters');
  lines.push('');
  lines.push('USEFUL RESOURCES');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('• Residential Tenancies Board (RTB): www.rtb.ie');
  lines.push('• Citizens Information: www.citizensinformation.ie');
  lines.push('• Threshold (Tenant Support): www.threshold.ie');
  lines.push('• Housing Agency: www.housingagency.ie');
  lines.push('');
  lines.push('================================================================================');
  lines.push('                          End of Report');
  lines.push('================================================================================');

  // Create and download file
  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hestia-lease-analysis-${new Date().getTime()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy analysis summary to clipboard
 */
export function copyAnalysisToClipboard(result: AnalysisResult): Promise<void> {
  const summary = [];

  summary.push('🏠 HESTIA LEASE ANALYSIS SUMMARY');
  summary.push('');

  // Count issues
  const alertCount = result.alerts.length;
  const missingClauseCount = result.missing_clauses?.length || 0;

  if (alertCount === 0 && missingClauseCount === 0) {
    summary.push('✅ No issues found in your lease!');
  } else {
    if (alertCount > 0) {
      summary.push(`⚠️ ${alertCount} Legal Insight${alertCount > 1 ? 's' : ''} Found`);
    }
    if (missingClauseCount > 0) {
      summary.push(`📋 ${missingClauseCount} Missing Clause${missingClauseCount > 1 ? 's' : ''}`);
    }
  }

  summary.push('');
  summary.push('Generated by Hestia - AI Tenant Advocate');
  summary.push('For full report, export from the application.');

  const text = summary.join('\n');
  return navigator.clipboard.writeText(text);
}
