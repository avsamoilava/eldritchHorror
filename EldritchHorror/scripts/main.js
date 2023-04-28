import ancientsData from "../data/ancients.js";
import blueCardsData from "../data/blueCards.js";
import brownCardsData from "../data/brownCards.js";
import greenCardsData from "../data/greenCards.js";
import difficultiesData from "../data/difficulty.js";

const ancientBtns = document.querySelectorAll('.ancient__item');
const difficultBtns = document.querySelectorAll('.difficulty__item');
const goBtn = document.querySelector('.go__button');
const firstStageRow = Array.from(document.querySelector('.pack__row_1').children);
const secondStageRow = Array.from(document.querySelector('.pack__row_2').children);
const thirdStageRow = Array.from(document.querySelector('.pack__row_3').children);
const turnOffCard = document.querySelector('.cards__item_turnOff');
const turnOnCard = document.querySelector('.cards__item_turnOn');

//* для случайного перемешивания массива
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


//* для подсветки и обозначения активной кнопки (карты древних, кнопки сложности)
function setLight(buttons) {
    buttons.forEach(elem => {
        elem.addEventListener('click', function () {
            buttons.forEach(elem => {
                if (elem.classList.contains('_active')) {
                    elem.classList.remove('_active')
                }
            })
            elem.classList.toggle('_active');
        })
    })
}

setLight(ancientBtns);
setLight(difficultBtns);


//* получение информации с активных карты древнего и кнопки сложности
function checkParams() {
    return {
        ancient: Array.from(ancientBtns).filter(elem => elem.classList.contains('_active'))[0].getAttribute('id'),
        difficult: Array.from(difficultBtns).filter(elem => elem.classList.contains('_active'))[0].getAttribute('id')
    }
}


//* определение, сколько карт каждого цвета необходимо для колоды установленного древнего
function howManyCards(ancientName) {
    let obj = ancientsData.filter(elem => elem.name === ancientName)[0];
    let blue = obj.firstStage.blueCards + obj.secondStage.blueCards + obj.thirdStage.blueCards;
    let green = obj.firstStage.greenCards + obj.secondStage.greenCards + obj.thirdStage.greenCards;
    let brown = obj.firstStage.brownCards + obj.secondStage.brownCards + obj.thirdStage.brownCards;
    return {
        blue,
        green,
        brown
    }
}


//* отрисовка схемы для выбранного древнего
function renderScheme(ancientName) {
    let ancientCard = ancientsData.filter(elem => elem.name === ancientName)[0];

    function renderRow(row, stage) {
        row.forEach(elem => {
            if (elem.classList.contains('pack__item_green')) {
                elem.textContent = ancientCard[stage].greenCards;
            } else
            if (elem.classList.contains('pack__item_blue')) {
                elem.textContent = ancientCard[stage].blueCards;
            } else
            if (elem.classList.contains('pack__item_brown')) {
                elem.textContent = ancientCard[stage].brownCards;
            }
        })
    }
    renderRow(firstStageRow, 'firstStage'),
    renderRow(secondStageRow, 'secondStage'),
    renderRow(thirdStageRow, 'thirdStage')
}


//* получение колоды в соответствии с выбранным уровнем сложности
function formDeckForDifficulty(level, requiredAmount) {
    let diff = [];
    let bluePack = new Set();
    let greenPack = new Set();
    let brownPack = new Set();


    // получаем необходимые типы сложности карт
    difficultiesData.forEach(elem => {
        if (elem.id === level) diff = elem.cardsDifficulty;
    })


    // фильтруем карты по уровню сложности
    diff.forEach(elem => {
        blueCardsData.forEach(blueCard => {
            if (blueCard.difficulty === elem) bluePack.add(blueCard)
        })
        greenCardsData.forEach(greenCard => {
            if (greenCard.difficulty === elem) greenPack.add(greenCard)
        })
        brownCardsData.forEach(brownCard => {
            if (brownCard.difficulty === elem) brownPack.add(brownCard)
        })
    })


    // Добираем необходимое количество карт, если не хватает
    function addCard(pack, color, data) {
        if (pack.size < requiredAmount[color]) {
            let arr = data.filter(elem => elem.difficulty === 'normal')
            shuffle(arr);

            let i = 0;
            while (pack.size < requiredAmount[color]) {
                pack.add(arr[i])
                i++
            }
        }
    }

    addCard(bluePack, 'blue', blueCardsData)
    addCard(greenPack, 'green', greenCardsData)
    addCard(brownPack, 'brown', brownCardsData)


    // Удаляем лишние карты
    function removeCard(pack, color) {
        pack = Array.from(pack).sort(() => Math.random() - 0.5);
        return pack.slice(0, requiredAmount[color])
    }

    return {
        blue: removeCard(bluePack, 'blue'),
        green: removeCard(greenPack, 'green'),
        brown: removeCard(brownPack, 'brown')
    }
};


//* создаем отдельные колоды для каждого этапа
function formStageDecks(deck, ancient) {
    let [firstDeck, secondDeck, thirdDeck] = [[], [], []];
    let ancientCard = ancientsData.filter(elem => elem.id === ancient)[0];

    function formDeck(pack, stage) {
        for (let i = 0; i < ancientCard[stage].blueCards; i++) {
            pack.push(deck.blue.pop())
        }
        for (let i = 0; i < ancientCard[stage].greenCards; i++) {
            pack.push(deck.green.pop())
        }
        for (let i = 0; i < ancientCard[stage].brownCards; i++) {
            pack.push(deck.brown.pop())
        }
    }

    formDeck(firstDeck, 'firstStage')
    formDeck(secondDeck, 'secondStage')
    formDeck(thirdDeck, 'thirdStage')

    return [
        ...thirdDeck.sort(() => Math.random() - 0.5),
        ...secondDeck.sort(() => Math.random() - 0.5),
        ...firstDeck.sort(() => Math.random() - 0.5)
    ]
}

let turnCard = function(){};

//* слушатель кнопки "замешать колоду"
goBtn.addEventListener('click', () => {
    // установка дефолтных стилей для заголовков схемы и отображаемых карт
    let subtitles = document.querySelectorAll('.pack__subtitle');
    subtitles.forEach(elem => elem.style.color = '#fff')
    turnOffCard.style.background = 'url(./assets/mythicCardBackground.png) center/contain no-repeat';
    turnOnCard.style.background = 'none';

    let params = checkParams();
    let cardsAmount = howManyCards(params.ancient);
    let finalDeck = formDeckForDifficulty(params.difficult, cardsAmount);
    let sortStageDeck = formStageDecks(finalDeck, params.ancient);
    renderScheme(params.ancient);

    let [firstRowSum, secondRowSum, thirdRowSum] = [0, 0, 0]

    firstStageRow.forEach(elem => {
        firstRowSum += +elem.textContent
    })
    secondStageRow.forEach(elem => {
        secondRowSum += +elem.textContent
    })
    thirdStageRow.forEach(elem => {
        thirdRowSum += +elem.textContent
    })

    turnCard = function () {
        let url;
        let currentCard;

        if (firstRowSum > 0) {
            currentCard = sortStageDeck.pop();
            url = currentCard.cardFace;
            turnOnCard.style.background = `url(${url}) center/cover no-repeat`;
            firstStageRow.forEach(elem => {
                if (elem.classList.contains(currentCard.color)) {
                    elem.textContent = Number(elem.textContent) - 1;
                }
            })
            firstRowSum--;
        }

        if (secondRowSum > 0 && firstRowSum == 0) {
            document.querySelector('.pack__subtitle_1').style.color = 'red'
            currentCard = sortStageDeck.pop();
            url = currentCard.cardFace;
            turnOnCard.style.background = `url(${url}) center/cover no-repeat`;
            secondStageRow.forEach(elem => {
                if (elem.classList.contains(currentCard.color)) {
                    elem.textContent = Number(elem.textContent) - 1;
                }
            })
            secondRowSum--;
        }

        if (thirdRowSum > 0 && firstRowSum == 0 && secondRowSum == 0) {
            document.querySelector('.pack__subtitle_2').style.color = 'red'
            currentCard = sortStageDeck.pop();
            url = currentCard.cardFace;
            turnOnCard.style.background = `url(${url}) center/cover no-repeat`;
            thirdStageRow.forEach(elem => {
                if (elem.classList.contains(currentCard.color)) {
                    elem.textContent = Number(elem.textContent) - 1;
                }
            })
            thirdRowSum--;
        }

        if (firstRowSum === 0 && secondRowSum === 0 && thirdRowSum === 0) {
            document.querySelector('.pack__subtitle_3').style.color = 'red';
            turnOffCard.style.background = 'none'
        }
    };
}) 


//* слушатель колоды
turnOffCard.addEventListener('click', ()=> turnCard())