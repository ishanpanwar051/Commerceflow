import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const catalogSource = await fs.readFile(path.join(root, 'backend/prisma/user-catalog.ts'), 'utf8')
const poolsSource = await fs.readFile(path.join(root, 'backend/prisma/subcategory-image-pools.ts'), 'utf8')
const verified = JSON.parse(await fs.readFile(path.join(root, 'backend/prisma/verified-images.json'), 'utf8'))
const badIds = new Set(verified.bad.map((entry) => entry.id))
const poolIds = [...poolsSource.matchAll(/'((?:photo|https?)[^']+)'/g)].map((match) => match[1]).filter((id) => id.startsWith('photo-'))
const subcategoryCount = (catalogSource.match(/S\(/g) || []).length
const productCount = (catalogSource.match(/\['[^\]]+\]/g) || []).reduce((count, group) => count + (group.match(/'[^']+'/g) || []).length, 0)
const poolDeclarations = [...poolsSource.matchAll(/'([a-z-]+)': \[/g)].map((match) => match[1])
const uniquePoolIds = new Set(poolIds)
const duplicatePoolIds = poolIds.filter((id, index) => poolIds.indexOf(id) !== index)
const knownBadPoolIds = poolIds.filter((id) => badIds.has(id))
const urlFor = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`
const checkUrl = async (id) => {
  try {
    const response = await fetch(urlFor(id), { method: 'HEAD' })
    return { id, status: response.status, contentType: response.headers.get('content-type') || '' }
  } catch {
    return { id, status: 0, contentType: '' }
  }
}
const networkResults = []
for (let index = 0; index < poolIds.length; index += 20) {
  networkResults.push(...await Promise.all(poolIds.slice(index, index + 20).map(checkUrl)))
}
const brokenNetworkIds = networkResults.filter(({ status, contentType }) => status < 200 || status >= 400 || !contentType.startsWith('image/')).map(({ id }) => id)
const report = {
  poolIds: poolIds.length,
  uniquePoolIds: uniquePoolIds.size,
  duplicatePoolIds: [...new Set(duplicatePoolIds)],
  knownBadPoolIds: [...new Set(knownBadPoolIds)],
  brokenNetworkIds: [...new Set(brokenNetworkIds)],
  poolDeclarations: poolDeclarations.length,
  detectedSubcategoryDeclarations: subcategoryCount,
  detectedProducts: productCount,
  verifiedOkIds: verified.ok.length,
  knownBadIds: verified.bad.length,
}
console.log(JSON.stringify(report, null, 2))
if (report.duplicatePoolIds.length || report.knownBadPoolIds.length || report.brokenNetworkIds.length) process.exitCode = 1
