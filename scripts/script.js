const wrapperElem = document.getElementById("wrapper")
const playButton = document.getElementById("playButton")
const toggleSoundButton = document.getElementById("toggleSoundButton")
const loaderElem = document.getElementById("loader")
const menuElem = document.getElementById("menu")
const gameElem = document.getElementById("game")
const audioElem = document.querySelector("audio")
const leftBlockElem = document.getElementById("leftBlock")
const rightBlockElem = document.getElementById("rightBlock")
const stackElem = document.getElementById("stack")
const pointsElem = document.getElementById("points")
const scoreElemList = document.querySelectorAll("#score")

let score = 0
let points = 0
let isReady = false
let isChangeColorBack = false

const rgb = { r: 0, g: 0, b: 0 }

let isDirectionByX = true
let isAudioPlay = false

let stackList = [
    {
        width: 300,
        height: 300,
        disable: false,
        isDirectionByX: true,
    },
    {
        width: 300,
        height: 300,
        disable: true,
        isDirectionByX: true,
    }
]

function main() {
    generateColors()
    getScore()
}
main()

function getScore() {
    const data = JSON.parse(localStorage.getItem('score') ?? '{ "score": 0 }')
    score = data.score
    scoreElemList.forEach(elem => {
        elem.innerText = data.score
    })
}

function generateColors() {

    for (let i = 0; i < 3; i++) {
        const rand = Math.round(Math.random() * 255)
        rgb[Object.keys(rgb)[i]] = rand
    }

    wrapperElem.style.background = `linear-gradient(rgb(${rgb.r}, ${rgb.b}, ${rgb.b}), rgb(${rgb.r + 50}, ${rgb.b + 50}, ${rgb.b + 50}))`
}

function play() {
    loaderElem.classList.add('active')
    setTimeout(() => {
        menuElem.classList.add('hide')
        gameElem.classList.remove('hide')
        loaderElem.classList.remove('active')
        generateColors()
        isReady = true
        renderStack()
    }, 800)
}

function back() {
    isReady = false
    stackElem.classList.add("back")
    setTimeout(() => {
        loaderElem.classList.add('active')
        setTimeout(() => {
            points = 0
            stackList = [
                {
                    width: 300,
                    height: 300,
                    left: 0,
                    bottom: 0,
                    disable: false,
                    isDirectionByX: true
                },
                {
                    width: 300,
                    height: 300,
                    left: 0,
                    bottom: 0,
                    disable: true,
                    isDirectionByX: true
                }
            ]
            stackElem.classList.remove("back")
            stackElem.innerHTML = ""
            menuElem.classList.remove('hide')
            gameElem.classList.add('hide')
            loaderElem.classList.remove('active')
        }, 1400)
    }, 2000)
}

function renderStack() {
    stackElem.innerHTML = ""
    stackList.forEach((block, index) => {
        const newBlock = createBlock(block, index, stackList.length)
        stackElem.appendChild(newBlock)
    })

    if ((rgb.r + rgb.g + rgb.b) / 3 > 200) {
        isChangeColorBack = true
    }

    if ((rgb.r + rgb.g + rgb.b) / 3 < 100) {
        isChangeColorBack = false
    }

    if (isChangeColorBack) {
        rgb.r -= 3
        rgb.g -= 3
        rgb.b -= 3
    } else {
        rgb.r += 3
        rgb.g += 3
        rgb.b += 3
    }

    wrapperElem.style.background = `linear-gradient(rgb(${rgb.r}, ${rgb.b}, ${rgb.b}), rgb(${rgb.r + 50}, ${rgb.b + 50}, ${rgb.b + 50}))`
}

function createBlock(blockObj, index, amount) {
    const newBlock = document.createElement("div")
    newBlock.id = `id_${index}`

    newBlock.classList.add("block")
    blockObj.disable && newBlock.classList.add("disable")
    blockObj.isDirectionByX && newBlock.classList.add("isDirectionByX")

    if (blockObj.isSuper && index === 1) {
        newBlock.classList.add('super')
    }

    newBlock.innerHTML = `<div class="top"><div class="left" id="leftBlock"></div>
    <div class="right" id="rightBlock"></div></div>`

    const leftBg = `rgb(${rgb.r - 30 + (index * 10)}, ${rgb.b - 5 + (index * 10)}, ${rgb.b + 35 + (index * 10)})`
    const rightBg = `rgb(${rgb.r + 10 + (index * 10)}, ${rgb.b + 35 + (index * 10)}, ${rgb.b + 75 + (index * 10)})`

    newBlock.querySelector('.left').style.background = leftBg
    newBlock.querySelector('.right').style.background = rightBg

    newBlock.style.bottom = 600 - index * 56 + "px"

    newBlock.querySelector('.top').style.width = blockObj.width + "px"
    newBlock.querySelector('.top').style.height = blockObj.height + "px"

    newBlock.style.zIndex = amount - index

    return newBlock
}

function tach() {
    if (isReady) {
        const currentBlock = stackElem.querySelector('#id_0')
        const prevBlock = stackElem.querySelector('#id_1')

        const currentBlockStyles = window.getComputedStyle(currentBlock)
        const prevBlockStyles = window.getComputedStyle(prevBlock)

        const currentMarginLeft = currentBlockStyles.marginLeft.split("p")[0]
        const prevMarginLeft = prevBlockStyles.marginLeft.split("p")[0]

        const currentMarginTop = currentBlockStyles.marginBottom.split("p")[0]
        const prevMarginTop = prevBlockStyles.marginBottom.split("p")[0]


        const dx = currentMarginLeft + 50 - prevMarginLeft
        const dy = currentMarginTop + 50 - prevMarginTop

        if (stackList[0].isDirectionByX) {
            const normalize = Math.round(Math.abs(dx))

            if (normalize > stackList[0].width) {
                return back()
            }

            const newWidth = stackList[0].width - normalize
            stackList[0].width -= normalize
            stackList[0].disable = true
            stackList[0].isSuper = normalize === 0

            stackList.unshift({ width: newWidth, height: stackList[0].height, disable: false, isDirectionByX: false })
        } else {
            const normalize = Math.round(Math.abs(dy))

            if (normalize > stackList[0].height) {
                return back()
            }

            const newHeight = stackList[0].height - normalize
            stackList[0].height -= normalize
            stackList[0].disable = true
            stackList[0].isSuper = normalize === 0

            stackList.unshift({ width: stackList[0].width, height: newHeight, disable: false, isDirectionByX: true })
        }

        renderStack()

        points += 1
        pointsElem.innerHTML = points

        if (points > score) {
            localStorage.setItem('score', JSON.stringify({ score: points }))
          
            scoreElemList.forEach(elem => {
                elem.innerText = points
            })
        }
    }
}

function toggleSound() {
    if (isAudioPlay) {
        audioElem.pause()
        console.log('Sound off')
    } else {
        audioElem.play()
            .then(() => {
                isAudioPlay = true
                console.log('Sound on')
            })
            .catch(console.log)
    }

    toggleSoundButton.classList.toggle('active')
    isAudioPlay = !isAudioPlay
}

// Handle buttons

playButton.addEventListener("click", () => play())
toggleSoundButton.addEventListener("click", () => toggleSound())
document.addEventListener("mousedown", () => tach())
