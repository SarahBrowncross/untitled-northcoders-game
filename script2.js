const createNode = (name, children=[]) => ({
	name, 
	children
})

const app = document.querySelector('app')

const nodes = {
	A: createNode('A', ['B', 'C']),
	B: createNode('B', ['D', 'E']),
	C: createNode('C'),
	D: createNode('D'),
	E: createNode('E'),
}

const startNode = 'A';

const handleNode = (nodeID) => {
	const node = nodes[nodeID]
	app.textContent = node.name
	node.children.forEach(child => {
		const childButton = document.createElement('button')
		childButton.textContent = child
		childButton.addEventListener('click', () => handleNode(child))
		app.appendChild(childButton)
	});
}

handleNode(startNode)
