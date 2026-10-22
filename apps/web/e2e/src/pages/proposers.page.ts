/**
 * Proposers section of Settings → Setup: add, list and delete proposers.
 *
 * Rule: Page Objects hold locators and actions only. Assertions belong in the test.
 */
import { type Page, type Locator } from '@playwright/test'
import { ROUTES } from '../data/constants'

// The section renders only once the delegates request answers, which can take long on a loaded stack
const SECTION_LOAD_TIMEOUT_MS = 30_000

export class ProposersPage {
  readonly section: Locator
  readonly addButton: Locator
  readonly addressInput: Locator
  readonly nameInput: Locator
  readonly submitButton: Locator
  readonly confirmDeleteButton: Locator

  constructor(private readonly page: Page) {
    this.section = page.getByTestId('proposer-section')
    this.addButton = page.getByTestId('add-proposer-btn')
    const dialog = page.getByRole('dialog')
    this.addressInput = dialog.getByTestId('address-book-input').getByRole('combobox')
    this.nameInput = dialog.getByLabel('Name')
    this.submitButton = page.getByTestId('submit-proposer-btn')
    this.confirmDeleteButton = page.getByTestId('confirm-delete-proposer-btn')
  }

  async goto(safe: string): Promise<void> {
    await this.page.goto(`${ROUTES.settingsSetup}?safe=${safe}`)
    await this.section.waitFor({ timeout: SECTION_LOAD_TIMEOUT_MS })
  }

  /** The table row of a proposer, found by the name the address book shows for it */
  row(name: string): Locator {
    return this.section.getByRole('row').filter({ hasText: name })
  }

  /** Opens the dialog, fills it and submits; the connected wallet signs the delegation */
  async add(address: string, name: string): Promise<void> {
    await this.addButton.click()
    await this.addressInput.fill(address)
    await this.nameInput.fill(name)
    await this.submitButton.click()
  }

  /** Deletes a proposer from its row; the connected wallet signs the deletion */
  async delete(name: string): Promise<void> {
    await this.row(name).getByTestId('delete-proposer-btn').click()
    await this.confirmDeleteButton.click()
  }
}
