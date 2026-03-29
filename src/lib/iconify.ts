/**
 * Iconify API integration.
 * Search and render 200,000+ icons — no API key needed.
 * https://api.iconify.design/
 */

export interface IconifyIcon {
  prefix: string;          // e.g. "mdi", "fa-solid"
  name: string;            // e.g. "home"
  fullName: string;        // e.g. "mdi:home"
}

export interface IconifySearchResult {
  icons: IconifyIcon[];
  total: number;
}

/**
 * Search for icons by keyword.
 * Returns icon identifiers that can be rendered with getIconSVG().
 */
export async function searchIcons(query: string, limit: number = 48): Promise<IconifySearchResult> {
  try {
    const res = await fetch(
      `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    const data = await res.json();

    const icons: IconifyIcon[] = (data.icons || []).map((fullName: string) => {
      const [prefix, ...nameParts] = fullName.split(":");
      return {
        prefix,
        name: nameParts.join(":"),
        fullName,
      };
    });

    return { icons, total: data.total || icons.length };
  } catch (error) {
    console.warn("Iconify search failed:", error);
    return { icons: [], total: 0 };
  }
}

/**
 * Get the SVG markup for a specific icon.
 * Returns the raw SVG string ready to be inserted as innerHTML.
 */
export async function getIconSVG(
  prefix: string,
  name: string,
  options?: { width?: number; height?: number; color?: string }
): Promise<string> {
  try {
    const params = new URLSearchParams();
    if (options?.width) params.set("width", String(options.width));
    if (options?.height) params.set("height", String(options.height));
    if (options?.color) params.set("color", options.color);

    const url = `https://api.iconify.design/${prefix}/${name}.svg?${params.toString()}`;
    const res = await fetch(url);
    return await res.text();
  } catch (error) {
    console.warn(`Failed to fetch icon ${prefix}:${name}:`, error);
    return "";
  }
}

/**
 * Prebuilt icon suggestions per industry to show curated results first.
 */
export const INDUSTRY_ICON_QUERIES: Record<string, string> = {
  Technology: "computer code tech",
  Healthcare: "medical health heart",
  Education: "school book education",
  Finance: "money finance chart",
  "Food & Beverage": "food restaurant chef",
  Fashion: "fashion clothing design",
  "Real Estate": "house building home",
  "Sports & Fitness": "sport gym fitness",
  Travel: "travel airplane globe",
  Entertainment: "entertainment music film",
  Consulting: "business briefcase consulting",
  Construction: "construction hammer build",
  Automotive: "car vehicle automotive",
  "Beauty & Spa": "beauty flower spa",
  Photography: "camera photo lens",
  Music: "music headphone speaker",
  Legal: "law justice scale",
  Agriculture: "farm plant agriculture",
  "Non-Profit": "charity volunteer heart",
  "E-Commerce": "shopping cart store",
};

/**
 * Get suggested icons for an industry.
 */
export async function getIndustryIcons(industry: string, limit: number = 24): Promise<IconifySearchResult> {
  const query = INDUSTRY_ICON_QUERIES[industry] || industry;
  return searchIcons(query, limit);
}
