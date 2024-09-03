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
    x: canvas.width / 3,
    y: canvas.height / 3
}

let nodes = []
let selectedNode = null;

class _Node {
    constructor(name, color, size = 10) {
        this.name = name
        this.color = color
        this.size = size
        this.isSelected = false

        const points = this.getPoints()
        this.x = points.x
        this.y = points.y

        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    getPoints() {
        let x = lastPoint.x + (this.size * 4)
        let y = nodes.length % 2 == 1 ? lastPoint.y - (this.size * 8): lastPoint.y + (this.size * 8)

        lastPoint.x = x
        lastPoint.y = y

        return {x, y}
    }

    draw() {
        ctx.fillStyle = this.color

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText(this.name, this.x, this.y - (this.size * 2))

        if(this.isSelected) {
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2, false)
            ctx.stroke()
        }
    }

    select() {
        this.isSelected = true
        lastPoint.x = this.x
        lastPoint.y = this.y
        selectedNode = this
    }

    unselect() {
        this.isSelected = false
    }

    isInsideRect(x, y) {
        return (x > this.x - this.size && x < this.x + this.size && y > this.y - this.size && y < this.y + this.size);
    }
}

function addNode(name, color) {
    const node = new _Node(name, color)
    
    nodes.push(node)
}

function editNode(name, color) {
    selectedNode.name = name
    selectedNode.color = color
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

    if(selectedNode == null) {
        addNode(nameInput.value, colorInput.value)
        tools.reset()
    } else {
        editNode(nameInput.value, colorInput.value)
    }
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