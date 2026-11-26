import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__printCalls', {
      configurable: true,
      value: 0,
      writable: true,
    })
    window.print = () => {
      window.__printCalls += 1
    }
  })
  await page.goto('/')
})

test('creates sections and distinguishes invalid chords from unavailable diagrams', async ({
  page,
}) => {
  await page.getByLabel('Song title').fill('Window Seat')
  await page.getByLabel('Section 1 title').fill('Verse')

  const chordInput = page.getByLabel('Add a chord to section 1')
  await chordInput.fill('H#')
  await chordInput.press('Enter')

  await expect(
    page.getByText("That chord name isn't recognized.", { exact: false }),
  ).toBeVisible()
  await expect(chordInput).toHaveValue('H#')

  await chordInput.fill('Am')
  await chordInput.press('Enter')
  await chordInput.fill('Cmaj7')
  await chordInput.press('Enter')

  await expect(page.locator('.song-section .chord-progression')).toContainText(
    'Am',
  )
  await expect(
    page.locator('.song-section .chord-card--unavailable'),
  ).toContainText('Cmaj7')
  await expect(
    page.locator('.song-section .chord-card__unavailable-note'),
  ).toContainText('Diagram unavailable')
  await expect(chordInput).toHaveValue('')

  await page.getByRole('button', { name: 'Add a section' }).click()
  await expect(page.getByLabel('Section 2 title')).toBeFocused()
  await page.getByLabel('Section 2 title').fill('Chorus')
  await page.getByRole('button', { name: 'Remove Chorus' }).click()
  await expect(page.getByLabel('Section 2 title')).toHaveCount(0)
  await expect(page.getByLabel('Song title')).toHaveValue('Window Seat')
})

test('transposes all chords from their original names and respects the range', async ({
  page,
}) => {
  const chordInput = page.getByLabel('Add a chord to section 1')
  await chordInput.fill('Am')
  await chordInput.press('Enter')
  await page.getByRole('button', { name: 'Transpose up one semitone' }).click()
  await expect(
    page.locator('.song-section .progression-item').nth(0),
  ).toContainText('A#m')

  await chordInput.fill('F')
  await chordInput.press('Enter')
  await expect(page.locator('.song-section .progression-item')).toHaveCount(2)
  await expect(
    page.locator('.song-section .progression-item').nth(1),
  ).toContainText('F#')

  await page.getByRole('button', { name: 'Transpose down one semitone' }).click()
  await expect(
    page.locator('.song-section .progression-item').nth(0),
  ).toContainText('Am')
  await expect(
    page.locator('.song-section .progression-item').nth(1),
  ).toContainText('F')

  for (let step = 0; step < 11; step += 1) {
    await page.getByRole('button', { name: 'Transpose down one semitone' }).click()
  }

  await expect(page.getByRole('button', { name: 'Transpose down one semitone' })).toBeDisabled()
  await expect(page.locator('.transpose-value strong')).toHaveText('-11')
})

test('confirms reset and retains the chosen theme', async ({ page }) => {
  await page.getByRole('button', { name: /Switch to dark theme/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('chordnote-theme')))
    .toBe('dark')
  await expect(page).toHaveTitle('Chordnote — guitar song sheets')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  const chordInput = page.getByLabel('Add a chord to section 1')
  await chordInput.fill('Am')
  await chordInput.press('Enter')
  await page.getByRole('button', { name: 'Transpose up one semitone' }).click()

  await page.getByRole('button', { name: 'Clear song' }).click()
  const dialog = page.getByRole('dialog', { name: 'Clear this song?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Keep editing' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Clear song' }).click()

  await expect(page.getByLabel('Song title')).toHaveValue('')
  await expect(page.getByLabel('Section 1 title')).toHaveValue('')
  await expect(page.locator('.transpose-value strong')).toHaveText('0')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('prints names only without chord diagrams and includes transposed names', async ({
  page,
}) => {
  await page.getByLabel('Song title').fill('Quiet Morning')
  await page.getByLabel('Section 1 title').fill('Verse')
  const chordInput = page.getByLabel('Add a chord to section 1')
  await chordInput.fill('Am')
  await chordInput.press('Enter')
  await page.getByRole('button', { name: 'Transpose up one semitone' }).click()

  await page.getByRole('button', { name: 'Print', exact: false }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Choose your print layout',
  })
  await dialog.getByLabel('Chord names only').check()
  await dialog.getByRole('button', { name: 'Print song' }).click()

  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __printCalls: number }).__printCalls,
      ),
    )
    .toBe(1)

  await page.emulateMedia({ media: 'print' })
  const printSheet = page.locator('.print-sheet')
  await expect(printSheet).toBeVisible()
  await expect(printSheet.getByRole('heading', { name: 'Quiet Morning' })).toBeVisible()
  await expect(printSheet.getByText('Verse')).toBeVisible()
  await expect(
    printSheet.locator('.print-name-progression li > span:last-child'),
  ).toHaveText('A#m')
  await expect(printSheet.locator('svg')).toHaveCount(0)
  await expect(printSheet).toHaveAttribute('data-print-layout', 'names')
})

test('prints light chord diagrams for a short progression', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.getByLabel('Song title').fill('The Long Way Home')
  await page.getByLabel('Section 1 title').fill('Chorus')

  const chordInput = page.getByLabel('Add a chord to section 1')
  for (const chord of ['Am', 'F', 'C', 'G']) {
    await chordInput.fill(chord)
    await chordInput.press('Enter')
  }

  await page.getByRole('button', { name: 'Print', exact: false }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Choose your print layout',
  })
  await dialog.getByLabel('Chord diagrams').check()
  await dialog.getByRole('button', { name: 'Print song' }).click()

  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __printCalls: number }).__printCalls,
      ),
    )
    .toBe(1)
  await page.emulateMedia({ media: 'print' })

  const printSheet = page.locator('.print-sheet')
  await expect(printSheet.locator('.print-progression svg')).toHaveCount(1)
  await expect(printSheet.locator('.print-progression svg')).toHaveAttribute(
    'aria-label',
    'Chord progression: Am - F - C - G',
  )
  await expect(page.locator('.print-sheet svg')).toHaveCount(1)
  await expect(page.locator('.print-sheet')).toHaveAttribute(
    'data-print-layout',
    'diagrams',
  )
})

test('keeps the editor within a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))

  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  await expect(page.getByRole('button', { name: 'Add a section' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Switch to dark theme/ })).toBeVisible()
})

test('paginates a long song into a multi-page A4 PDF', async ({ page }) => {
  await page.getByLabel('Song title').fill('Long Rehearsal Set')

  for (let section = 0; section < 30; section += 1) {
    await page.getByRole('button', { name: /Add a section/ }).click()
  }

  await page.getByRole('button', { name: 'Print', exact: false }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Choose your print layout',
  })
  await dialog.getByLabel('Chord names only').check()
  await dialog.getByRole('button', { name: 'Print song' }).click()

  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __printCalls: number }).__printCalls,
      ),
    )
    .toBe(1)

  const pdf = await page.pdf({
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: true,
  })
  const pdfText = pdf.toString('latin1')
  const pageCount = pdfText.match(/\/Type\s*\/Page\b/g)?.length ?? 0

  expect(pdfText.startsWith('%PDF-')).toBe(true)
  expect(pageCount).toBeGreaterThan(1)
})

declare global {
  interface Window {
    __printCalls: number
  }
}
