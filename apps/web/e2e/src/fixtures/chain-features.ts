import type { Page } from '@playwright/test'

type ChainConfig = { chainId: string; features?: string[] }

function withoutFeature(chain: ChainConfig, chainId: string, feature: string): ChainConfig {
  return chain.chainId === chainId ? { ...chain, features: chain.features?.filter((f) => f !== feature) } : chain
}

/**
 * Removes `feature` from the chain config that the app reads. Only for a flag that gates something the test does
 * not cover, such as the Safe Pro gate in front of a free feature; call it before the first navigation.
 */
export async function removeChainFeature(page: Page, { chainId, feature }: { chainId: string; feature: string }) {
  await page.route('**/v2/chains**', async (route) => {
    const response = await route.fetch()
    const body = await response.json()
    const json = Array.isArray(body?.results)
      ? { ...body, results: body.results.map((chain: ChainConfig) => withoutFeature(chain, chainId, feature)) }
      : withoutFeature(body, chainId, feature)
    await route.fulfill({ response, json })
  })
}
