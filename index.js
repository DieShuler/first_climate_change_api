const PORT = process.env.PORT || 8080
const express = require('express')
const axios = require('axios').default
const cheerio = require('cheerio')

// This just lets us call express commands with app.<thing>()
const app = express()

// Create an array of the different sites we want to scrape links from
const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-change',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        // The telegraph uses relative hrefs on their site so we need a baseurl
        // ? How can this be written to just dynamically add a baseurl when needed?
        base: 'https://www.telegraph.co.uk'
    },
    {
        name: 'nyt',
        address: 'https://www.nytimes.com/international/section/climate',
        base: '',
    },
    {
        name: 'latimes',
        address: 'https://www.latimes.com/environment',
        base: '',
    },
    {
        name: 'smh',
        address: 'https://www.smh.com.au/environment/climate-change',
        base: 'https://www.smh.com.au',
    },
    {
        name: 'un',
        address: 'https://www.un.org/climatechange',
        base: '',
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.co.uk/news/science_and_environment',
        base: 'https://www.bbc.co.uk',
    },
    {
        name: 'es',
        address: 'https://www.standard.co.uk/topic/climate-change',
        base: 'https://www.standard.co.uk'
    },
    {
        name: 'sun',
        address: 'https://www.thesun.co.uk/topic/climate-change-environment/',
        base: ''
    },
    {
        name: 'dm',
        address: 'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',
        base: ''
    },
    {
        name: 'nyp',
        address: 'https://nypost.com/tag/climate-change/',
        base: ''
    }
]

// Create an array to put all the article links you return later.
const articles = []

// Write a function to collect links rather then in our app.get routing
newspapers.forEach(newspaper => {
    // Go make a request to the URL
    axios.get(newspaper.address, )
        // We are able to "then" the function to do stuff on the response.
        .then(response => {
            const html = response.data
            // I sort of get how we're using $, but I don't REALLY understand it is or does.
            const $ = cheerio.load(html)

            $('a:contains("climate")', html).each(function(){
                const title = $(this).text()
                const url = $(this).attr('href')

                // Push specific info as an object in to the artciles array we created above.
                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })
        })
})

// Here is where we handle request to the root page
app.get('/', (req, res) => {
    res.json('Welcome to my Climat Change News API')
})

// This is the /news page that scrapes the guardian for URLs that have "climate" in the title
app.get('/news', (req, res) => {
    // axios.get('https://www.theguardian.com/environment/climate-crisis') 
    //     .then((response) => {
    //         const html = response.data
    //         const $ = cheerio.load(html)

    //         $('a:contains("climate")', html).each(function() {
    //             const title = $(this).text()
    //             const url = $(this).attr('href')
    //             articles.push({
    //                 title,
    //                 url
    //             })
    //         })
    //         res.json(articles)
    //     }).catch((err) => console.log(err))

    // Just respond with the ~list~ array of articles we created above
    res.json(articles)

    // Some of the articles titles contain escape characters.  Could we write a regex to scrape these out without "hurting" the URL or title?
})

// you can name newspaperId whatever you want.  the : tells nodejs that whatever comes next is going to be a parameter.
app.get('/news/:newspaperId', async (req, res) => {
    // This will return EVERYTHING in the request
    // console.log(req)
    // This will return on the the parameter you select (as long as it exists)
    // console.log(req.params.newspaperId)
    const newspaperId = req.params.newspaperId

    // filter the newspapers array above and look for something that matches :newspaperId and return the "address" parameter of the first found object.
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    // Also defining a baseURL that we can later, but it has to be pulled from array as well.
    // (there's gotta be a cleaner way of doing both of these things)
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

    // Do another axios get and "then" chain
    axios.get(newspaperAddress)
        // I'm not sure what the => {} means, but it seems to be working.
        // Note:  This is variable declaration.  Make sure you spell "response" right.
        .then(response => {
            // SOOOO many local variables with the same name...
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("climate")', html).each(function() {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

