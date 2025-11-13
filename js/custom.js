async function fetchUmamiStats() {
  const websiteId = '6fb16f52-d628-49be-8381-47438945b943';
  const endpoint = 'https://cloud.umami.is/api/websites/' + websiteId + '/stats';

  try {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();

    document.getElementById('umami-site-uv').innerText = data.uniques;
    document.getElementById('umami-site-pv').innerText = data.pageviews;
  } catch (err) {
    console.error('Umami stats error:', err);
  }
}

document.addEventListener('DOMContentLoaded', fetchUmamiStats);