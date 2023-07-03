/*
    Script crawl data of https://www.formula1.com/en/results.html/
    src: src/data/data/crawl-data.tsx
*/

const dataYear = [...Array(3)].map((_, i) => new Date().getFullYear() - i);
const dataType = [
    {
        title: "Races",
        value: "races",
    },
    {
        title: "DRIVERS",
        value: "drivers",
    },
    {
        title: "Teams",
        value: "team",
    },
    {
        title: "DHL FASTEST LAP AWARD",
        value: "fastest-laps",
    },
];
async function Fetch(url) {
    return await fetch(url)
    .then(function (response) {
        // When the page is loaded convert it to text
        return response.text();
    })
    .then(function (html) {
        // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, "text/html");

        // You can now even select part of that html as you would in the regular DOM
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;
        return doc;
    })
    .catch(function (err) {
        console.log("Failed to fetch page: ", err);
    });
}

let data2 = {};

const crawlData = () => {
    data2 = {};
    // for data Year
    dataYear.forEach(year => {
        data2[year] = {};
        // for data Type
        dataType.forEach(async type => {
            data2[year][type.value] = {};

            // Fetch page get data by data year and type selected
            let contents = await Fetch(`https://www.formula1.com/en/results.html/${year}/${type.value}.html`);

            // Convert html to array content
            contents = Array.from(
                contents.querySelectorAll(".resultsarchive-filter-container > div:nth-child(3) a")
            ).map(i => ({
                title: i.querySelector("span").innerHTML,
                value: i.dataset.value,
            }));
            data2[year][type.value] = contents;

            // for data Content
            contents.forEach(async (content, index) => {
                data2[year][type.value][content.value] = {};
                // Fetch page get data by content selected
                let result = await Fetch(
                    `https://www.formula1.com/en/results.html/${year}}/${type.value}/${content.value}.html`
                );

                // Convert html to data table header
                title = Array.from(result.querySelectorAll("table.resultsarchive-table>thead th")).map(
                    i => i.querySelector("abbr")?.innerHTML || i.innerHTML.trim()
                );

                // Convert html to data table row
                row = Array.from(result.querySelectorAll("table.resultsarchive-table>tbody>tr")).map(i =>
                    Array.from(i.querySelectorAll("td")).map(i => i.querySelector("a")?.innerHTML || i.innerHTML.trim())
                );

                converData = [];
                // Map title and row to array object
                row.forEach((ct, index) => {
                    title.forEach((key, i) => (converData[index] = { ...converData[index], [key]: ct[i] }));
                });
                data2[year][type.value][index]["result"] = converData;
            });
        });
    });
};
crawlData();
