import { getInput, getBooleanInput, setFailed } from '@actions/core';
import axios from 'axios';

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';

const run = async () => {
  const cloudflareApiToken = getInput('cloudflareApiToken');
  const cloudflareZoneId = getInput('cloudflareZoneId');
  const cloudflareHostname = getInput('cloudflareHostname');
  const cid = getInput('cid');
  const shouldPurge = getBooleanInput('purge');

  const headers = {
    Authorization: `Bearer ${cloudflareApiToken}`,
    'Content-Type': 'application/json',
  };

  // Update DNSLink TXT record
  let cloudflareHostnameId: undefined | string;

  try {
    const getHostnameIdOutput = await axios.get(
      `${CLOUDFLARE_API_URL}/zones/${cloudflareZoneId}/web3/hostnames`,
      {
        headers,
      },
    );

    if (!getHostnameIdOutput.data.success) {
      throw getHostnameIdOutput.data.errors;
    }

    const cloudflareDnsRecord = getHostnameIdOutput.data.result.find(
      (r: { name: string }) => r.name === cloudflareHostname,
    );

    if (!cloudflareDnsRecord) {
      throw new Error(
        `Could not find ID of hostname ${cloudflareHostname}. Make sure cloudflareHostname input (${cloudflareHostname}) is correct.`,
      );
    }

    cloudflareHostnameId = cloudflareDnsRecord?.id;
  } catch (error) {
    setFailed('Failed to fetch hostname ID');
    console.log(error);
    return;
  }

  // Update DNSLink TXT record
  try {
    console.log('Updating DNSLink TXT record');
    const updateDnsOutput = await axios.patch(
      `${CLOUDFLARE_API_URL}/zones/${cloudflareZoneId}/web3/hostnames/${cloudflareHostnameId}`,
      {
        dnslink: `/ipfs/${cid}`,
      },
      {
        headers,
      },
    );

    if (!updateDnsOutput.data.success) {
      throw updateDnsOutput.data.errors;
    }

    console.log('Successfully updated DNSLink TXT record');
  } catch (error) {
    setFailed('Failed to update DNSLink TXT record');
    console.log(error);
    return;
  }

  if (!shouldPurge) {
    return;
  }

  // Purge cache
  console.log('Purging DNS cache');
  try {
    const purgeCacheOutput = await axios.post(
      `${CLOUDFLARE_API_URL}/zones/${cloudflareZoneId}/purge_cache`,
      {
        files: [`https://${cloudflareHostname}/*`],
      },
      {
        headers,
      },
    );

    if (!purgeCacheOutput.data.success) {
      throw purgeCacheOutput.data.errors;
    }

    console.log('Successfully purged DNS cache');
  } catch (error) {
    setFailed('Failed to purge DNS cache');
    console.log(error);
    return;
  }
};

run();
