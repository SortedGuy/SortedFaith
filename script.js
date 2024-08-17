document.addEventListener('DOMContentLoaded', function () {
    // Load saved data from Local Storage
    loadData();
    
    document.getElementById('get-verse').addEventListener('click', loadVerses);
    
    // Load and display time spent on the site
    let startTime = Date.now();
    setInterval(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('time-spent').textContent = `Time Spent: ${timeSpent} seconds`;
    }, 1000);
});

let thumbsUpCount = 0;
let favoritedVerses = []; // Store objects with verse text and feeling
let verseStates = {}; // Store feedback states for each feeling

// Load data from Local Storage
function loadData() {
    const savedFavoritedVerses = localStorage.getItem('favoritedVerses');
    if (savedFavoritedVerses) {
        favoritedVerses = JSON.parse(savedFavoritedVerses);
    }

    const savedThumbsUpCount = localStorage.getItem('thumbsUpCount');
    if (savedThumbsUpCount) {
        thumbsUpCount = parseInt(savedThumbsUpCount, 10);
    }

    const savedVerseStates = localStorage.getItem('verseStates');
    if (savedVerseStates) {
        verseStates = JSON.parse(savedVerseStates);
    }
}

// Save data to Local Storage
function saveData() {
    localStorage.setItem('favoritedVerses', JSON.stringify(favoritedVerses));
    localStorage.setItem('thumbsUpCount', thumbsUpCount);
    localStorage.setItem('verseStates', JSON.stringify(verseStates));
}

// Load verses based on the selected feeling
function loadVerses() {
    const feeling = document.getElementById('feeling').value;

    if (!feeling) {
        alert('Please select a feeling.');
        return;
    }

    const data = {
        "verses": [
            {
                "title": "John 3:16",
                "text": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
                "feelings": ["lost"]
            },
            {
                "title": "Psalm 23:1",
                "text": "The LORD is my shepherd; I shall not want.",
                "feelings": ["confused"]
            },
            {
                "title": "Philippians 4:13",
                "text": "I can do all things through Christ which strengtheneth me.",
                "feelings": ["grateful"]
            },
            {
                "title": "Test",
                "text": "no annoy, ok?",
                "feelings": ["annoyed"]
            },
            {
                "title": "Psalm 34:18",
                "text": "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
                "feelings": ["sad"]
            },
            {
                "title": "Matthew 11:28",
                "text": "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
                "feelings": ["sad"]
            },
            {
                "title": "Proverbs 3:5-6",
                "text": "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
                "feelings": ["lost"]
            },
            {
                "title": "James 1:5",
                "text": "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
                "feelings": ["confused"]
            },
            {
                "title": "1 Thessalonians 5:18",
                "text": "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
                "feelings": ["grateful"]
            },
            {
                "title": "Romans 8:28",
                "text": "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
                "feelings": ["grateful"]
            }
        ]
    };

    const versesContainer = document.getElementById('verses-container');
    versesContainer.innerHTML = '';

    const verses = data.verses.filter(v => v.feelings.includes(feeling)).slice(0, 2);

    verses.forEach((verse) => {
        const verseElement = document.createElement('div');
        verseElement.className = 'verse';
        verseElement.dataset.verseText = verse.text;
        verseElement.dataset.liked = verseStates[feeling]?.[verse.text]?.liked || 'false'; // Load previous state
        verseElement.dataset.disliked = verseStates[feeling]?.[verse.text]?.disliked || 'false'; // Load previous state
        verseElement.innerHTML = `
            <h3>${verse.title}</h3>
            <p>${verse.text}</p>
            <div class="feedback">
                <i class="fas fa-thumbs-up" data-type="like"></i>
                <i class="fas fa-thumbs-down" data-type="dislike"></i>
                <i class="fas fa-star" data-type="favorite"></i>
            </div>
        `;
        versesContainer.appendChild(verseElement);

        // Apply saved feedback state
        if (verseElement.dataset.liked === 'true') {
            verseElement.querySelector('i[data-type="like"]').classList.add('liked');
        }
        if (verseElement.dataset.disliked === 'true') {
            verseElement.querySelector('i[data-type="dislike"]').classList.add('disliked');
        }
        if (favoritedVerses.some(v => v.text === verse.text && v.feeling === feeling)) {
            verseElement.querySelector('i[data-type="favorite"]').classList.add('favorited');
        }
    });

    updateFunFacts();
}

// Handle click events for feedback icons
document.addEventListener('click', function (event) {
    const target = event.target;
    const verseElement = target.closest('.verse'); // Get the parent verse element
    const feeling = document.getElementById('feeling').value;

    if (verseElement) {
        if (target.classList.contains('fa-thumbs-up') || target.classList.contains('fa-thumbs-down')) {
            const thumbsUpIcon = verseElement.querySelector('i[data-type="like"]');
            const thumbsDownIcon = verseElement.querySelector('i[data-type="dislike"]');

            if (target.classList.contains('fa-thumbs-up')) {
                if (verseElement.dataset.liked === 'true') {
                    // Toggle off
                    target.classList.remove('liked');
                    thumbsUpCount--;
                    verseElement.dataset.liked = 'false';
                } else {
                    // Toggle on
                    target.classList.add('liked');
                    if (verseElement.dataset.disliked === 'true') {
                        // Remove thumbs-down
                        thumbsDownIcon.classList.remove('disliked');
                        thumbsUpCount++;
                        verseElement.dataset.liked = 'true';
                        verseElement.dataset.disliked = 'false';
                    } else {
                        thumbsUpCount++;
                        verseElement.dataset.liked = 'true';
                    }
                }
                updateFeedbackState(feeling, verseElement.dataset.verseText, { liked: verseElement.dataset.liked, disliked: verseElement.dataset.disliked });
                updateFunFacts();
                saveData(); // Save data after feedback changes
            }
            if (target.classList.contains('fa-thumbs-down')) {
                if (verseElement.dataset.disliked === 'true') {
                    // Toggle off
                    target.classList.remove('disliked');
                    verseElement.dataset.disliked = 'false';
                } else {
                    // Toggle on
                    target.classList.add('disliked');
                    if (verseElement.dataset.liked === 'true') {
                        // Remove thumbs-up
                        thumbsUpIcon.classList.remove('liked');
                        thumbsUpCount--;
                        verseElement.dataset.liked = 'false';
                        verseElement.dataset.disliked = 'true';
                    } else {
                        verseElement.dataset.disliked = 'true';
                    }
                }
                updateFeedbackState(feeling, verseElement.dataset.verseText, { liked: verseElement.dataset.liked, disliked: verseElement.dataset.disliked });
                updateFunFacts();
                saveData(); // Save data after feedback changes
            }
        }

        if (target.classList.contains('fa-star')) {
            target.classList.toggle('favorited');
            const verseText = verseElement.querySelector('p').textContent;
            const verseTitle = verseElement.querySelector('h3').textContent;
            const verseFeeling = document.getElementById('feeling').value; // Get the current feeling
            
            if (target.classList.contains('favorited')) {
                if (!favoritedVerses.some(v => v.text === verseText && v.feeling === verseFeeling)) {
                    favoritedVerses.push({ text: verseText, title: verseTitle, feeling: verseFeeling });
                }
            } else {
                favoritedVerses = favoritedVerses.filter(v => !(v.text === verseText && v.feeling === verseFeeling));
            }
            updateFunFacts();
            saveData(); // Save data after favorites change
        }
    }
});

// Update the Fun Facts section with the current data
function updateFunFacts() {
    document.getElementById('thumbs-up-count').textContent = `Thumbs Up: ${thumbsUpCount}`;
    
    const favoritedList = document.getElementById('favorited-verses');
    favoritedList.innerHTML = '';  // Clear existing verses

    if (favoritedVerses.length > 0) {
        favoritedVerses.forEach(verse => {
            const verseElement = document.createElement('div');
            verseElement.className = 'favorited-item';
            verseElement.innerHTML = `
                <h4>${verse.title}</h4>
                <p>${verse.text}</p>
                <p><strong>Feeling:</strong> ${verse.feeling}</p>
            `;
            favoritedList.appendChild(verseElement);
        });
    } else {
        favoritedList.textContent = 'None';
    }
}

// Update the stored feedback state for the current feeling and verse
function updateFeedbackState(feeling, verseText, state) {
    if (!verseStates[feeling]) {
        verseStates[feeling] = {};
    }
    verseStates[feeling][verseText] = state;
    saveData(); // Save data after feedback state changes
}



