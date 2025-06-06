async function fetchHeroData() {
    const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';
    try {
        const apiRes = await fetch(apiUrl);
        const data = await apiRes.json();
        const ref = data.refs[0].ref;
        const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"hero")]]`);
        const docsData = await docsRes.json();
        const container = document.getElementById('hero-content-dynamic');
        if (!docsData.results || docsData.results.length === 0) {
            container.innerHTML = '<p>لا توجد بيانات.</p>';
            return;
        }
        // Use tittle1, tittle2, who_we_are from API response
        const doc = docsData.results[0];
        const tittle1Arr = doc.data.tittle1 || [];
        const tittle2Arr = doc.data.tittle2 || [];
        const whoWeAreArr = doc.data.who_we_are || [];
        const tittle1 = tittle1Arr.length > 0 ? (tittle1Arr[0].text || tittle1Arr[0]) : '';
        const tittle2 = tittle2Arr.length > 0 ? (tittle2Arr[0].text || tittle2Arr[0]) : '';
        const whoWeAre = whoWeAreArr.length > 0 ? (whoWeAreArr[0].text || whoWeAreArr[0]) : '';
        container.innerHTML = `
          <h1 class="hero-title">${tittle1.replace(/^@@/, '')}</h1>
          <p class="hero-subtitle">${tittle2}</p>
          <div style="margin-top: 15px;"> 
            <a href="contact.html" class="btn btn-primary" style="margin: 5px;">Get Your Free Consultation</a> 
            <a href="services.html" class="btn btn-primary" style="margin: 5px;" data-en="Our Services" data-ar="خدماتنا">Our Services</a> 
          </div>
        `;
        // Also update the company overview section if present
        var overviewTitle = document.querySelector('.company-overview .section-title');
        var overviewText = document.getElementById('who-we-are-text');
        if (overviewTitle && overviewText) {
            overviewTitle.textContent = 'Who We Are';
            overviewText.textContent = whoWeAre;
        }
    } catch (err) {
        document.getElementById('hero-content-dynamic').innerHTML = '<p>حدث خطأ أثناء جلب البيانات.</p>';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('index-page')) {
        fetchHeroData();
    }
});
