/********************************************
    Script crawl data of https://www.formula1.com/en/results.html/
    src: src/data/data/crawl-data.tsx
********************************************/

const dataYear = [...Array(5)].map((_, i) => new Date().getFullYear() - i);
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
    dataYear.forEach(year => {
        data2[year] = {};
        dataType.forEach(async type => {
            data2[year][type.value] = {};
            let contents = await Fetch(`https://www.formula1.com/en/results.html/${year}/${type.value}.html`);
            contents = Array.from(
                contents.querySelectorAll(".resultsarchive-filter-container > div:nth-child(3) a")
            ).map(i => ({ title: i.querySelector("span").innerHTML, value: i.dataset.value }));
            data2[year][type.value] = contents;
            for(const index in contents){
                const content = contents[index];
            // contents.forEach(async (content, index) => {
                data2[year][type.value][content.value] = {};
                let result = await Fetch(
                    `https://www.formula1.com/en/results.html/${year}}/${type.value}/${content.value}.html`
                );
                const title = Array.from(result.querySelectorAll("table.resultsarchive-table>thead th")).map(i =>
                    i.innerText.replace(/  +/g, " ").trim()
                );
                const row = Array.from(result.querySelectorAll("table.resultsarchive-table>tbody>tr")).map(i =>
                    Array.from(i.querySelectorAll("td")).map(i => i?.innerText.replace(/  +/g, " ").trim())
                );
                const converData = [];
                row.forEach((ct, index) => {
                    title.forEach((key, i) => {
                        let id ='';
                        let fieldId ='';

                        // tìm field dùng làm <id> đề tìm kiếm data theo năm của dữ liệu được chọn, dùng để vẽ Chart
                        const field = new Map([
                            ['races', "Winner|Driver|Grand Prix"],
                            ['drivers', "Winner|Driver|Grand Prix"],
                            ['team', "Team|Grand Prix"],
                        ])
                        if(field.get(type.value).split('|').includes(key)){
                             id=ct[i]?.replace(/[^a-zA-Z0-9]/g,'') || '';
                        }
                        return (converData[index] = { ...converData[index], [key]: ct[i],  ...id ? {id: id, fieldId: key} : {} });

                    });
                });
                data2[year][type.value][index]["result"] = converData;
            };
        });
    });
};

crawlData();
