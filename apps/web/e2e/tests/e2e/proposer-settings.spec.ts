import { CHAIN_IDS } from '../../src/data/constants'
import { removeChainFeature } from '../../src/fixtures/chain-features'
import { isIsolated } from '../../src/fixtures/isolated-data'
import { test, expect } from '../../src/fixtures/journey.fixture'
import { seedSafe } from '../../src/seed/safe'
import { ProposersPage } from '../../src/pages/proposers.page'

const PROPOSER_NAME = 'Isolated proposer'

test.describe('Proposers in the Safe settings', { tag: '@e2e' }, () => {
  test.skip(!isIsolated, 'Seeds its own Safe on the isolated stack')

  test('should add a proposer and then delete it when an owner signs both changes', async ({
    safePage,
    safeApiClient,
    journey,
  }, testInfo) => {
    const { owner3, owner4 } = journey.owners
    const safe = await seedSafe(journey, { threshold: 1 })
    testInfo.annotations.push({ type: 'safe-address', description: safe.prefixedAddress })
    // Safe Pro gates adding proposers behind a Workspace plan, which is not what this test covers
    await removeChainFeature(safePage, { chainId: CHAIN_IDS.sepolia, feature: 'PROPOSER_GATING' })

    const proposers = new ProposersPage(safePage)
    await proposers.goto(safe.prefixedAddress)
    await proposers.add(owner3.address, PROPOSER_NAME)

    await expect
      .poll(async () => (await safeApiClient.getDelegates(safe.address)).results.map((d) => [d.delegate, d.delegator]))
      .toEqual([[owner3.address, owner4.address]])
    await expect(proposers.row(PROPOSER_NAME)).toBeVisible()

    await proposers.delete(PROPOSER_NAME)

    await expect.poll(async () => (await safeApiClient.getDelegates(safe.address)).results).toEqual([])
    await expect(proposers.row(PROPOSER_NAME)).toHaveCount(0)
  })
})
