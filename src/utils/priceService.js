const FIXED_FEE_USD = 5; // $5 fixed fractionalization fee
const FALLBACK_FEE_ETH = 0.002; // Hardcoded fallback fee in ETH (implies ~$2500 ETH)

/**
 * Fetches current ETH price in USD from CoinGecko (no API key needed)
 * @returns {Promise<number>} ETH price in USD
 */
export async function getEthPriceUSD() {
  try {
    console.log('Fetching ETH price from CoinGecko...');
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const ethPrice = data.ethereum.usd;
    
    if (!ethPrice || ethPrice <= 0) {
      throw new Error('Invalid ETH price received');
    }
    
    console.log('ETH Price from CoinGecko:', ethPrice);
    return ethPrice;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    console.warn('Using fallback: 0.002 ETH fixed fee');
    
    // Return implied price so fee calculation gives us 0.002 ETH
    // $5 / $2500 = 0.002 ETH
    return 2500;
  }
}

/**
 * Calculates fractionalization fee in ETH based on current USD price
 * @returns {Promise<{feeInEth: string, ethPriceUSD: string, feeInUSD: number, usingFallback: boolean}>}
 */
export async function calculateFractionalizationFee() {
  try {
    const ethPriceUSD = await getEthPriceUSD();
    const usingFallback = ethPriceUSD === 2500;
    
    let feeInEth;
    if (usingFallback) {
      // Use hardcoded fallback
      feeInEth = FALLBACK_FEE_ETH;
    } else {
      // Calculate from real price
      feeInEth = FIXED_FEE_USD / ethPriceUSD;
    }
    
    return {
      feeInEth: feeInEth.toFixed(6), // 0.002000
      ethPriceUSD: ethPriceUSD.toFixed(2),
      feeInUSD: FIXED_FEE_USD, // Always $5
      usingFallback
    };
  } catch (error) {
    console.error('Error calculating fee:', error);
    
    // fallback
    return {
      feeInEth: FALLBACK_FEE_ETH.toFixed(6),
      ethPriceUSD: '2500.00',
      feeInUSD: FIXED_FEE_USD,
      usingFallback: true
    };
  }
}

/**
 * Get the fixed fee in USD (for display purposes)
 * @returns {number}
 */
export function getFixedFeeUSD() {
  return FIXED_FEE_USD;
}

/**
 * Get the fallback fee in ETH (for display purposes)
 * @returns {number}
 */
export function getFallbackFeeETH() {
  return FALLBACK_FEE_ETH;
}
