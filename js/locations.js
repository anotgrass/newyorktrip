const locations = {
    "Wednesday, December 11": [
        { 
            name: "West New York", 
            coords: [-74.0143, 40.7870], 
            color: "blue", 
            description: "Explore West New York with views of the Hudson River and Manhattan skyline.", 
            time: "8:00 PM", 
            website: "" 
        }
    ],

    "Thursday, December 12": [
        { 
            name: "Rockefeller Center", 
            coords: [-73.979858, 40.759245], 
            color: "green", 
            description: "Start your day at Rockefeller Center, an iconic entertainment and shopping complex in Midtown.", 
            time: "7:00 AM", 
            website: "" 
        },
        { 
            name: "Rockefeller Christmas Tree", 
            coords: [-73.9787, 40.7587], 
            color: "green", 
            description: "Visit the famous Rockefeller Christmas Tree, a must-see during the holiday season.", 
            time: "9:00 AM", 
            website: "" 
        },
        { 
            name: "Rockefeller Skating Rink", 
            coords: [-73.978409, 40.758607], 
            color: "green", 
            description: "Glide on ice at the Rockefeller Skating Rink, a classic New York winter activity.", 
            time: "9:30 AM", 
            website: "" 
        },
        { 
            name: "Saks Fifth Avenue", 
            coords: [-73.9742, 40.7602], 
            color: "green", 
            description: "Check out the holiday displays and upscale shopping at Saks Fifth Avenue.", 
            time: "10:30 AM", 
            website: "" 
        },
        { 
            name: "Central Park", 
            coords: [-73.9683, 40.7851], 
            color: "green", 
            description: "Explore Central Park’s scenic pathways, lakes, and iconic landmarks.", 
            time: "12:00 PM", 
            website: "" 
        },
        { 
            name: "Belvedere Castle", 
            coords: [-73.9692, 40.7794], 
            color: "green", 
            description: "Visit this charming castle in Central Park.", 
            time: "2:30 PM", 
            website: "" 
        },
        { 
            name: "The Mall and Literary Walk", 
            coords: [-73.9722, 40.7726], 
            color: "green", 
            description: "Walk along this picturesque tree-lined walkway.", 
            time: "3:00 PM", 
            website: "" 
        },
        { 
            name: "Gapstow Bridge", 
            coords: [-73.9731, 40.7688], 
            color: "green", 
            description: "See one of the most iconic bridges in Central Park.", 
            time: "4:00 PM", 
            website: "" 
        },
        { 
            name: "Radio City Music Hall (Rockettes)", 
            coords: [-73.9787, 40.7598], 
            color: "green", 
            description: "Watch the Rockettes at Radio City Music Hall.", 
            time: "5:00 PM", 
            website: "" 
        },
        { 
            name: "Top of the Rock", 
            coords: [-73.9785, 40.7587], 
            color: "green", 
            description: "Visit the Top of the Rock for breathtaking views of New York City at night.", 
            time: "7:00 PM", 
            website: "https://www.topoftherocknyc.com" 
        }
    ],

    "Friday, December 13": [
        { 
            name: "Brooklyn Bridge", 
            coords: [-73.9969, 40.7061], 
            color: "purple", 
            description: "Walk across the historic Brooklyn Bridge and take in stunning views of the city and the harbor.", 
            time: "8:00 AM", 
            website: "" 
        },
        { 
            name: "9/11 Memorial & Museum", 
            coords: [-74.0134, 40.7115], 
            color: "purple", 
            description: "Pay your respects and learn about the history of 9/11 at the Memorial and Museum in Lower Manhattan.", 
            time: "9:30 AM", 
            website: "https://www.911memorial.org" 
        },
        { 
            name: "Ellis Island", 
            coords: [-74.0403, 40.6995], 
            color: "purple", 
            description: "Take a ferry ride to Ellis Island and discover the history of immigration to America.", 
            time: "12:00 PM", 
            website: "" 
        },
        { 
            name: "Statue of Liberty", 
            coords: [-74.0445, 40.6892], 
            color: "purple", 
            description: "Visit the Statue of Liberty, one of the most iconic landmarks in the United States.", 
            time: "2:00 PM", 
            website: "https://www.cityexperiences.com/new-york/city-cruises/statue/" 
        },
        { 
            name: "Charging Bull", 
            coords: [-74.0134, 40.7056], 
            color: "purple", 
            description: "Visit the famous Charging Bull statue on Wall Street.", 
            time: "4:00 PM", 
            website: "" 
        },
        { 
            name: "Wall Street", 
            coords: [-74.0102, 40.7074], 
            color: "purple", 
            description: "Take a stroll down Wall Street, the financial hub of the U.S.", 
            time: "4:30 PM", 
            website: "" 
        },
        { 
            name: "Federal Hall", 
            coords: [-74.0103, 40.7079], 
            color: "purple", 
            description: "Visit Federal Hall, a historic building where George Washington was inaugurated.", 
            time: "5:00 PM", 
            website: "" 
        }
    ],

    "Saturday, December 14": [
        { 
            name: "Empire State Building", 
            coords: [-73.9857, 40.7484], 
            color: "red", 
            description: "Head to the top of the Empire State Building for breathtaking panoramic views of the city.", 
            time: "8:00 AM", 
            website: "https://ticketing.esbnyc.com/webstore/Shop/ViewItems.aspx?CG=Tickets&C=Express" 
        },
        { 
            name: "Bryant Park", 
            coords: [-73.9832, 40.7536], 
            color: "red", 
            description: "Take a stroll through Bryant Park, where you can also visit the Winter Village market.", 
            time: "10:00 AM", 
            website: "" 
        },
        { 
            name: "New York Public Library", 
            coords: [-73.9822, 40.7532], 
            color: "red", 
            description: "Visit the historic New York Public Library, one of the city’s most beautiful landmarks.", 
            time: "11:00 AM", 
            website: "" 
        },
        { 
            name: "Macy’s", 
            coords: [-73.9894, 40.7508], 
            color: "red", 
            description: "Shop at the famous Macy’s in Herald Square.", 
            time: "12:30 PM", 
            website: "" 
        },
        { 
            name: "Times Square", 
            coords: [-73.9855, 40.7580], 
            color: "red", 
            description: "End the night with the bright lights and bustling energy of Times Square.", 
            time: "5:00 PM", 
            website: "" 
        },
        { 
            name: "Marquis Theatre (Elf)", 
            coords: [-73.9864, 40.7590], 
            color: "red", 
            description: "Catch a performance of Elf: The Musical at the Marquis Theatre.", 
            time: "7:00 PM", 
            website: "" 
        }
    ],

    "Sunday, December 15": [
        { 
            name: "Chelsea Market", 
            coords: [-74.0061, 40.7425], 
            color: "orange", 
            description: "Start your day with food and shopping at Chelsea Market, a famous indoor marketplace.", 
            time: "9:00 AM", 
            website: "" 
        },
        { 
            name: "The High Line", 
            coords: [-74.0049, 40.7479], 
            color: "orange", 
            description: "Walk along the High Line, an elevated park that offers unique views of the city and the Hudson River.", 
            time: "10:30 AM", 
            website: "" 
        },
        { 
            name: "Hudson Yards", 
            coords: [-74.0017, 40.7546], 
            color: "orange", 
            description: "Explore the new Hudson Yards development, home to luxury shopping, dining, and The Vessel.", 
            time: "12:00 PM", 
            website: "https://www.hudsonyardsnewyork.com" 
        },
        { 
            name: "The Edge Observatory", 
            coords: [-74.0011, 40.7535], 
            color: "orange", 
            description: "Experience breathtaking views from The Edge, an observation deck with a glass floor suspended 1,100 feet above the ground.", 
            time: "2:00 PM", 
            website: "" 
        },
        { 
            name: "Little Italy", 
            coords: [-73.9974, 40.7191], 
            color: "orange", 
            description: "Explore Little Italy and enjoy some authentic Italian cuisine.", 
            time: "3:30 PM", 
            website: "" 
        },
        { 
            name: "Chinatown", 
            coords: [-73.9967, 40.7158], 
            color: "orange", 
            description: "Visit Chinatown for unique shops and delicious Chinese food.", 
            time: "5:00 PM", 
            website: "" 
        },
        { 
            name: "Aire Ancient Baths", 
            coords: [-74.0067, 40.7176], 
            color: "orange", 
            description: "Relax and unwind at the Aire Ancient Baths spa.", 
            time: "6:30 PM", 
            website: "https://beaire.com/en/aire-ancient-baths-new-york/" 
        }
    ],

    "Monday, December 16": [
        { 
            name: "LGA Airport", 
            coords: [-73.8726, 40.7769], 
            color: "yellow", 
            description: "Conclude your trip by catching your flight at LaGuardia Airport.", 
            time: "10:00 AM", 
            website: "" 
        }
    ]
};
