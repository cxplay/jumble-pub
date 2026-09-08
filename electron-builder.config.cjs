require('dotenv').config({ path: 'electron-builder.env' })

const hasAppleNotarizeCreds = !!process.env.APPLE_ID
const hasMacSigningCert = !!process.env.CSC_LINK || hasAppleNotarizeCreds

module.exports = {
  appId: 'moe.nostr.join',
  productName: 'Nostr!moe',
  copyright: 'Copyright © ${author}',
  directories: {
    output: 'release/${version}',
    buildResources: 'build'
  },
  publish: {
    provider: 'github',
    owner: 'cxplay',
    repo: 'jumble-pub',
    releaseType: 'draft'
  },
  files: [
    'dist/**/*',
    'dist-electron/**/*',
    'package.json',
    '!node_modules/**/*',
    'node_modules/ws/**/*'
  ],
  asar: true,
  mac: {
    category: 'public.app-category.social-networking',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    identity: hasMacSigningCert ? 'Developer ID Application' : null,
    notarize: hasAppleNotarizeCreds,
    target: [
      { target: 'dmg', arch: ['arm64'] },
      { target: 'zip', arch: ['arm64'] }
    ],
    artifactName: 'nostrmoe-mac-${arch}.${ext}',
    icon: 'public/pwa-512x512.png'
  },
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    artifactName: 'nostrmoe-windows-${arch}.${ext}',
    icon: 'public/pwa-512x512.png'
  },
  nsis: {
    oneClick: true,
    perMachine: false
  },
  linux: {
    target: ['AppImage', 'deb'],
    category: 'Network',
    artifactName: 'nostrmoe-linux-${arch}.${ext}',
    icon: 'public/pwa-512x512.png'
  }
}
