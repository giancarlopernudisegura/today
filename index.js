function fetchWikiDay(date, callback) {
	const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&prop=extracts&explaintex&exsectionformat=wiki&redirects=1&titles=${date.month}%20${date.day}`
	fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => res.json())
	.then(data => callback(data.query.pages))
}

function fetchWikiMonth(callback) {
	const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&prop=extracts&explaintex&exsectionformat=wiki&redirects=1&titles=List%20of%20month-long%20observances`
	fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => res.json())
	.then(data => callback(data.query.pages))
}


function getDate() {
	const date = new Date()
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	]
	const month = months[date.getMonth()]
	const day = date.getDay()
	return {month, day}
}

function insertEmojis(str) {
	for (let item in emojiDict) {
		const emoji = emojiDict[item]
		str = str.replace(`(${item})`, `<span class="emoji">${emoji}</span>`)
	}
	return str
}

function reorder(list) {
	const arr = Array.from(list)
	const priority = []
	for (let i in arr) {
		const regex = RegExp(emojiDict.International)
		if (regex.test(arr[i].innerHTML)) {
			priority.push(arr[i])
			// remove element from arr
			arr.splice(i, 1)
		}
	}
	const reorderedArray = [...priority, ...arr]
	return reorderedArray
}

function appendHolidays(data) {
	const list = getHolidays(data)
	const main = document.querySelector('.day')
	for (let item of list.children) {
		item.innerHTML = insertEmojis(item.innerHTML)
	}
	const ul = document.createElement('ul')
	for (let li of reorder(list.children)) {
		ul.append(li)
	}
	main.append(ul)
}

function appendMonths(data) {
	const html = getContent(data)
	const month = new Date().getMonth()
	const ul = html.querySelectorAll('ul')[month]
	const main = document.querySelector('.month')
	main.append(ul)
	for (let item of ul.children) {
		item.innerHTML = insertEmojis(item.innerHTML)
	}
}

function getContent(pages) {
	const firstPage = Object.keys(pages)[0]
	const data = pages[firstPage].extract
	const html = parseHTML(data)
	return html
}

function getHolidays(pages) {
	const html = getContent(pages)
	const holidays = html.querySelectorAll('h2 span')
	for (let h in holidays) {
		if (holidays[h].id === 'Holidays_and_observances') {
			const list = html.querySelectorAll('h2 ~ ul')[h]
			return list
		}
	}
}

function parseHTML(data) {
	const html = document.createElement('div')
	html.innerHTML = data
	return html
}

function randomColor() {
	const hue = Math.random() * 360
	const color = `hsl(${hue}, 80%, 70%)`
	return color
}

document.addEventListener('DOMContentLoaded', (event) => {
	fetchWikiDay(getDate(), appendHolidays)
	fetchWikiMonth(appendMonths)
	document.body.style.background = randomColor()
})
