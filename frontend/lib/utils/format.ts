export function formatSalaryInRupees(salary?: string): string {
  if (!salary) return '₹12 LPA - ₹25 LPA';
  if (salary.includes('₹') || salary.toLowerCase().includes('lpa') || salary.toLowerCase().includes('lakh')) {
    return salary;
  }

  // Convert standard USD strings to Indian Rupees LPA format
  if (salary.includes('130k') || salary.includes('185k') || salary.includes('130,000')) return '₹18 LPA - ₹35 LPA';
  if (salary.includes('140k') || salary.includes('190k') || salary.includes('140,000')) return '₹20 LPA - ₹40 LPA';
  if (salary.includes('95k') || salary.includes('145k') || salary.includes('95,000')) return '₹12 LPA - ₹25 LPA';
  if (salary.includes('110k') || salary.includes('160k') || salary.includes('110,000')) return '₹15 LPA - ₹28 LPA';
  if (salary.includes('75k') || salary.includes('105k') || salary.includes('75,000')) return '₹8 LPA - ₹16 LPA';
  if (salary.includes('120k') || salary.includes('170k') || salary.includes('120,000')) return '₹16 LPA - ₹30 LPA';
  if (salary.includes('125k') || salary.includes('180k') || salary.includes('125,000')) return '₹18 LPA - ₹32 LPA';
  if (salary.includes('100k') || salary.includes('155k') || salary.includes('100,000')) return '₹15 LPA - ₹30 LPA';
  if (salary.includes('85k') || salary.includes('130k') || salary.includes('85,000')) return '₹10 LPA - ₹20 LPA';
  if (salary.includes('125k') || salary.includes('175k')) return '₹16 LPA - ₹30 LPA';

  // Dynamic regex conversion for generic USD inputs ($Xk - $Yk or $X - $Y)
  const converted = salary.replace(/\$(\d+)(?:,\d{3})?k?\s*-\s*\$(\d+)(?:,\d{3})?k?/gi, (_, minStr, maxStr) => {
    const minVal = parseInt(minStr, 10);
    const maxVal = parseInt(maxStr, 10);
    const minLpa = Math.max(5, Math.round(minVal > 1000 ? minVal / 8500 : minVal * 0.14));
    const maxLpa = Math.max(minLpa + 5, Math.round(maxVal > 1000 ? maxVal / 7000 : maxVal * 0.18));
    return `₹${minLpa} LPA - ₹${maxLpa} LPA`;
  });

  return converted.replace(/\$/g, '₹');
}
