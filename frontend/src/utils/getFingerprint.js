import FingerprintJS from '@fingerprintjs/fingerprintjs';

async function getFingerprint() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
}

export default getFingerprint