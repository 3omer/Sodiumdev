
const index = (req, res) => {
    const articles = [
        {
            title: "Deserunt veniam cillum aliquip officia.",
            describtion: "Eiusmod culpa voluptate quis laborum proident ipsum eiusmod. Nisi nulla nostrud nulla in occaecat et eiusmod velit laboris. Ex sit magna sit irure reprehenderit elit velit excepteur commodo nulla.",
            author: "Omer M.",
            created: Date.now()
        },
        {
            title: "Magna eiusmod nisi tempor voluptate labore laborum aute.",
            describtion: "Aute dolor aliquip magna ullamco aliquip esse excepteur veniam labore consectetur. Proident excepteur proident aute est exercitation consequat id nostrud sit ad. Labore Lorem consectetur aliquip aute consectetur esse ullamco sint officia sint esse voluptate eiusmod.",
            author: "Picasso",
            created: Date.now()
        },
        {
            title: "Aute irure enim eiusmod laboris pariatur qui aute voluptate minim.",
            describtion: "Aliqua minim consequat in est ullamco consectetur aliqua incididunt pariatur minim. Et non amet esse duis nisi laboris est veniam. Labore cupidatat est sit excepteur reprehenderit ipsum ipsum tempor voluptate ea Lorem culpa ea. Minim enim sunt dolor adipisicing tempor velit ea tempor quis laborum consequat. Amet dolore laborum ex laborum enim ut sit excepteur anim dolor magna ut duis. Pariatur exercitation amet sit laborum dolore in Lorem dolore elit id ex ad.",
            author: "Zetta",
            created: Date.now()
        }
    ];

    res.render("index", { articles });
}

const article = (req, res) => {
    const article = {
        title: "Dolor aliqua ullamco minim laboris proident adipisicing excepteur esse voluptate cupidatat minim culpa.",
        body: `
        Ullamco minim magna est fugiat reprehenderit sunt Lorem ut et. Aute labore laboris nulla do adipisicing cupidatat. Ipsum sint duis eiusmod nulla ad. Do ea et anim id.
        
        Sint nostrud ex irure quis ullamco laborum elit tempor occaecat incididunt aliquip irure laborum. Sunt cupidatat nulla sit duis ex velit aute do adipisicing Lorem eiusmod. Voluptate et nulla consequat id minim pariatur laboris mollit incididunt dolor. Elit et consectetur laborum esse minim aliquip sint et aliquip ex. Et aute anim cupidatat adipisicing eiusmod sit mollit officia proident dolore laborum aute et. Occaecat commodo magna voluptate do nisi pariatur. Consequat ex do ipsum irure reprehenderit culpa pariatur minim non amet id voluptate reprehenderit.
        
        Cupidatat proident aliquip tempor laboris nostrud pariatur eu est deserunt. In amet sint magna occaecat sit in sint aliqua minim elit. Sint deserunt ex minim labore proident non. In cillum exercitation sit ipsum anim ad qui occaecat non veniam aliquip.`,
        
        tags: ["api", "backend", "web", "restful"],
        refs: [
            {
                title: "this is a refernce to ab blog",
                url: "#"
            },
            {
                title: "this is another refernce to other blog",
                url: "#"
            },
        ]
    };

    res.render("article", { article: article } );
}

module.exports = { index, article }
