const tools = document.querySelector(".tools")
const toolHeader = document.getElementById("toolHeader")
const nameInput = document.getElementById("name")
const colorInput = document.getElementById("color")
const toolBtn = document.getElementById("toolBtn")
const deleteBtn = document.getElementById("deleteBtn")
const cardName = document.getElementById("cardName")
const cardColor = document.getElementById("cardColor")

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let lastPoint = {
    x: canvas.width * 0.05,
    y: 100
}

let nodes = []
let selectedNode = null;

class _Node {
    constructor(name, color) {
        this.name = name
        this.color = color
        this.fontSize = 14

        this.padding = this.fontSize * 2
        this.width = 0
        this.height = this.fontSize + this.padding * 0.8
        this.isSelected = false

        this.calculateWidth()

        const points = this.getPoints()
        this.x = points.x
        this.y = points.y

        this.isDark = false
        this.isDragging = false
        this.offsetX = 0;
        this.offsetY = 0;

        this.isColorDark()
    }

    isColorDark() {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.color);
        const rgb =  result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null

        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
    
        const linearR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const linearG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const linearB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
        const luminance = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
    
        this.isDark = luminance < 0.5
    }

    calculateWidth() {
        const charWidth = this.fontSize * 0.6

        this.width = (this.name.length * charWidth) + this.padding
    }

    getPoints() {
        let x = lastPoint.x
        let y = lastPoint.y

        lastPoint.x = x + this.width + 10
        lastPoint.y = y

        if(lastPoint.x > canvas.width - (canvas.width * 0.2)) {
            lastPoint.x = canvas.width * 0.05
            lastPoint.y += this.height + 8
        }

        return {x, y}
    }

    draw() {
        ctx.fillStyle = this.color

        ctx.beginPath()
        ctx.roundRect(this.x, this.y, this.width, this.height, this.fontSize / 2)
        ctx.fill()

        ctx.fillStyle = this.isDark ? "#FFFFFF" : "#000000"
        ctx.font = `${this.fontSize}px monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2)

        if(this.isSelected) {
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4, (this.fontSize / 2) + 2)
            ctx.stroke()
        }
    }

    select() {
        this.isSelected = true
        selectedNode = this
    }

    unselect() {
        this.isSelected = false
    }

    isInsideRect(x, y) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height
    }
}

function addNode(name, color) {
    const node = new _Node(name, color)
    
    nodes.push(node)
}

function editNode(name, color) {
    selectedNode.name = name
    selectedNode.color = color
    selectedNode.isColorDark()
    selectedNode.calculateWidth()
}

function updateTools() {
    if(selectedNode != null) {
        toolHeader.innerText = "Edit Element"
        nameInput.value = selectedNode.name
        colorInput.value = selectedNode.color
        toolBtn.innerText = "Edit Element"
        deleteBtn.style.display = "block"   
    } else {
        tools.reset()
        toolHeader.innerText = "Configure Element"
        toolBtn.innerText = "Add Element"
        deleteBtn.style.display = "none"
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    nodes.forEach(node => {
        node.draw()
    })
    
    requestAnimationFrame(animate);
}

animate()

function handleMouseDown(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    let topMostNode = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].isInsideRect(mouseX, mouseY)) {
            topMostNode = nodes[i]
            break;
        }
    }

    nodes.forEach(node => {
        if (node === topMostNode) {
            node.isDragging = true
            node.offsetX = mouseX - node.x
            node.offsetY = mouseY - node.y
        }
    })
}

function handleMouseUp() {
    nodes.forEach(node => node.isDragging = false)
}

function handleMouseMove(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left
    const mouseY = e.clientY - canvas.getBoundingClientRect().top
    
    nodes.forEach(node => {
        if (node.isDragging) {
            node.x = mouseX - node.offsetX
            node.y = mouseY - node.offsetY
        } 

        if(node.isInsideRect(mouseX, mouseY)) {
            document.body.style.cursor = node.isDragging ? 'grabbing' : 'grab'
        } else {
            document.body.style.cursor = 'default'
        }
    })
}

function handleClick(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    let topMostNode = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].isInsideRect(mouseX, mouseY)) {
            topMostNode = nodes[i]
            break;
        }
    }

    selectedNode = null

    nodes.forEach(node => {
        node === topMostNode ? node.select() : node.unselect()
    })

    updateTools()
}

function handleDelete(e) {
    e.preventDefault()

    nodes.splice(nodes.indexOf(selectedNode), 1)
    
    tools.reset()
    selectedNode = null
    updateTools()
}

function handleSubmit(e) {
    e.preventDefault()

    if(nameInput.value.trim() == '') {
        tools.reset()
        return
    }

    if(selectedNode != null) {
        editNode(nameInput.value, colorInput.value)
        return
    }

    addNode(nameInput.value.trim(), colorInput.value)
    tools.reset()
}

canvas.addEventListener('mousedown', handleMouseDown)
canvas.addEventListener('mouseup', handleMouseUp)
canvas.addEventListener('mousemove', handleMouseMove)

canvas.addEventListener('touchstart', handleMouseDown)
canvas.addEventListener('touchend', handleMouseUp)
canvas.addEventListener('touchmove', handleMouseMove)

canvas.addEventListener('click', handleClick)
deleteBtn.addEventListener('click', handleDelete)
tools.addEventListener("submit", handleSubmit)

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})
