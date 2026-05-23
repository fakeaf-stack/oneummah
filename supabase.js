// Replace the URL and anon key with values from your Supabase project.
// Project URL format: https://<project-ref>.supabase.co
const SUPABASE_URL = 'https://rgezvgkhhweqcimmcuhb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZXp2Z2toaHdlcWNpbW1jdWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MDY4MTIsImV4cCI6MjA5NTA4MjgxMn0.aZ9bsvCGiafIcOlI0wSVbvY9mO09q90Lkbd3hS6_3es'

// IMPORTANT: Never put `service_role` or any secret key into this file
// or commit them to source control. Those keys must be used only on
// trusted backends or serverless functions.

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const ONEUMMAH_STATE = {
	products: [],
}

window.db = db
window.ONEUMMAH_STATE = ONEUMMAH_STATE

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"]|'/g, function (character) {
		return {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		}[character]
	})
}

function formatPrice(value) {
	const amount = Number(value)
	if (!Number.isFinite(amount)) return '€0,00'
	return '€' + amount.toFixed(2).replace('.', ',')
}

function getPrimaryImage(product) {
	const images = Array.isArray(product?.images)
		? product.images
		: Array.isArray(product?.product_images)
			? product.product_images
			: []

	if (!images.length) return ''

	return images[0].image_url || images[0].url || ''
}

function getProductDetailUrl(product) {
	return 'product.html?id=' + encodeURIComponent(product.id)
}

function getProductSizes(product) {
	if (!product || !Array.isArray(product.sizes) || !product.sizes.length) return 'One size'
	return product.sizes.filter(Boolean).join(' / ')
}

async function fetchProducts() {
	const { data: products, error: productsError } = await db
		.from('products')
		.select('*')

	if (productsError) throw productsError

	const productList = Array.isArray(products) ? products.slice().reverse() : []

	if (!productList.length) return []

	const productIds = productList.map(function (product) {
		return product.id
	})

	const { data: images, error: imagesError } = await db
		.from('product_images')
		.select('*')
		.in('product_id', productIds)

	if (imagesError) {
		console.warn('Supabase image lookup failed:', imagesError.message)
	}

	const groupedImages = new Map()
	;(images || [])
		.slice()
		.sort(function (left, right) {
			return (left.display_order || 0) - (right.display_order || 0)
		})
		.forEach(function (image) {
			const list = groupedImages.get(image.product_id) || []
			list.push(image)
			groupedImages.set(image.product_id, list)
		})

	return productList.map(function (product) {
		return Object.assign({}, product, {
			images: groupedImages.get(product.id) || [],
		})
	})
}

async function fetchProductById(productId) {
	const { data: product, error: productError } = await db
		.from('products')
		.select('*')
		.eq('id', productId)
		.maybeSingle()

	if (productError) throw productError
	if (!product) return null

	const { data: images, error: imagesError } = await db
		.from('product_images')
		.select('*')
		.eq('product_id', product.id)

	if (imagesError) {
		console.warn('Supabase image lookup failed:', imagesError.message)
	}

	const sortedImages = (images || []).slice().sort(function (left, right) {
		return (left.display_order || 0) - (right.display_order || 0)
	})

	return Object.assign({}, product, {
		images: sortedImages,
	})
}

function renderHomeProductCard(product) {
	const imageUrl = getPrimaryImage(product)
	const headline = escapeHtml(product.name || 'Untitled Product')
	const category = escapeHtml(product.category || 'New Drop')
	const description = escapeHtml(product.description || '')
	const price = formatPrice(product.price)
	const detailUrl = getProductDetailUrl(product)
	const mediaStyle = imageUrl
		? ' style="background-image: linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55)), url(\'' + imageUrl.replace(/'/g, '%27') + '\')"'
		: ''
	const heroText = escapeHtml((product.name || 'Product').split(' ')[0].toUpperCase())

	return [
		'<div class="product-card" onclick="window.location.href=\'' + detailUrl + '\'">',
		'<div class="product-placeholder"' + mediaStyle + '><span class="ph-text">' + heroText + '</span></div>',
		'<div class="product-badge">' + category + '</div>',
		'<div class="product-overlay"><button class="add-to-cart-btn" onclick="addToCart(event)">VIEW PRODUCT</button></div>',
		'</div>',
		'<div class="product-info">',
		'<p class="product-name">' + headline + '</p>',
		'<div class="product-prices"><span class="price-sale">' + price + '</span></div>',
		description ? '<p class="product-meta">' + description + '</p>' : '',
		'</div>',
	].join('')
}

function renderCatalogCard(product) {
	const imageUrl = getPrimaryImage(product)
	const name = escapeHtml(product.name || 'Untitled Product')
	const category = escapeHtml(product.category || 'New Drop')
	const sizes = escapeHtml(getProductSizes(product))
	const price = formatPrice(product.price)
	const detailUrl = getProductDetailUrl(product)
	const thumbStyle = imageUrl
		? ' style="background-image: linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.55)), url(\'' + imageUrl.replace(/'/g, '%27') + '\')"'
		: ''

	return [
		'<article class="card" onclick="window.location.href=\'' + detailUrl + '\'">',
		'<div class="thumb"' + thumbStyle + '><span class="thumb-text">' + category + '</span></div>',
		'<div class="meta">',
		'<p class="name">' + name + '</p>',
		'<p class="price"><span class="new">' + price + '</span></p>',
		'<p class="product-meta">Sizes: ' + sizes + '</p>',
		'</div>',
		'</article>',
	].join('')
}

function renderHomeGrid(container, products) {
	if (!container) return

	const list = Array.isArray(products) ? products : []

	if (!list.length) {
		container.innerHTML = '<div class="empty-state">No products yet. Upload one in admin.html.</div>'
		return
	}

	container.innerHTML = list.slice(0, 10).map(renderHomeProductCard).join('')
}

function renderCatalogGrid(container, products) {
	if (!container) return

	const list = Array.isArray(products) ? products : []

	if (!list.length) {
		container.innerHTML = '<div class="empty-state">No catalog products yet. Upload one in admin.html.</div>'
		return
	}

	container.innerHTML = list.map(renderCatalogCard).join('')
}

function getFilterValue(button) {
	return String(button?.textContent || 'ALL').trim().toLowerCase()
}

function filterProducts(products, filterValue) {
	const normalizedFilter = String(filterValue || 'all').toLowerCase()

	if (normalizedFilter === 'all') return products

	const term = normalizedFilter.replace(/\+/g, '').replace(/[^a-z0-9 ]/g, '').trim()

	return products.filter(function (product) {
		const category = String(product.category || '').toLowerCase()
		const name = String(product.name || '').toLowerCase()
		return category.includes(term) || name.includes(term)
	})
}

function applyCatalogFilter(button) {
	const filterBar = button ? button.closest('.catalog-filters') : null
	if (!filterBar) return

	const buttons = filterBar.querySelectorAll('.filter-btn')
	buttons.forEach(function (item) {
		item.classList.toggle('active', item === button)
	})

	const filterValue = getFilterValue(button)
	const page = filterBar.closest('.page') || document
	const grid = page.querySelector('.catalog-grid')
	if (!grid) return

	const products = filterProducts(ONEUMMAH_STATE.products, filterValue)

	if (grid.classList.contains('products-grid') || page.id === 'catalog') {
		if (grid.closest('.page')) {
			renderHomeGrid(grid, products)
		} else {
			renderCatalogGrid(grid, products)
		}
	} else {
		renderCatalogGrid(grid, products)
	}
}

function wireFilterButtons() {
	document.querySelectorAll('.catalog-filters').forEach(function (filterBar) {
		filterBar.querySelectorAll('.filter-btn').forEach(function (button) {
			if (button.getAttribute('data-bound') === 'true') return
			if (button.getAttribute('onclick')) return
			button.setAttribute('data-bound', 'true')
			button.addEventListener('click', function () {
				applyCatalogFilter(button)
			})
		})
	})
}

async function mountProductLists() {
	try {
		const products = await fetchProducts()
		ONEUMMAH_STATE.products = products

		document.querySelectorAll('.products-grid').forEach(function (container) {
			renderHomeGrid(container, products)
		})

		document.querySelectorAll('.catalog-grid').forEach(function (container) {
			if (container.closest('.page')) {
				renderHomeGrid(container, products)
				const filterBar = container.parentElement.querySelector('.catalog-filters')
				if (filterBar) {
					const activeButton = filterBar.querySelector('.filter-btn.active') || filterBar.querySelector('.filter-btn')
					if (activeButton) applyCatalogFilter(activeButton)
				}
			} else {
				const activeButton = document.querySelector('.catalog-filters .filter-btn.active') || document.querySelector('.catalog-filters .filter-btn')
				const filteredProducts = activeButton ? filterProducts(products, getFilterValue(activeButton)) : products
				renderCatalogGrid(container, filteredProducts)
			}
		})
	} catch (error) {
		console.warn('Supabase product load failed:', error.message)
	}
}

async function mountProductDetail() {
	const detailRoot = document.getElementById('productDetail')
	if (!detailRoot) return

	const params = new URLSearchParams(window.location.search)
	const productId = params.get('id')

	if (!productId) {
		detailRoot.innerHTML = '<p class="detail-empty">No product selected.</p>'
		return
	}

	try {
		const product = await fetchProductById(productId)

		if (!product) {
			detailRoot.innerHTML = '<p class="detail-empty">Product not found.</p>'
			return
		}

		const images = Array.isArray(product.images) && product.images.length ? product.images : [{ image_url: '' }]
		const gallery = images.map(function (image, index) {
			const active = index === 0 ? ' is-active' : ''
			const imageStyle = image.image_url ? ' style="background-image:url(\'' + image.image_url.replace(/'/g, '%27') + '\')"' : ''
			return '<button class="detail-thumb' + active + '" type="button" data-image="' + escapeHtml(image.image_url || '') + '"' + imageStyle + '></button>'
		}).join('')

		const heroImage = getPrimaryImage(product)
		const heroStyle = heroImage ? ' style="background-image: linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.4)), url(\'' + heroImage.replace(/'/g, '%27') + '\')"' : ''

		detailRoot.innerHTML = [
			'<div class="detail-media">',
			'<div class="detail-main-image"' + heroStyle + '></div>',
			'<div class="detail-gallery">' + gallery + '</div>',
			'</div>',
			'<div class="detail-copy">',
			'<p class="detail-category">' + escapeHtml(product.category || 'New Drop') + '</p>',
			'<h1 class="detail-title">' + escapeHtml(product.name || 'Untitled Product') + '</h1>',
			'<p class="detail-price">' + formatPrice(product.price) + '</p>',
			'<p class="detail-description">' + escapeHtml(product.description || 'No description available yet.') + '</p>',
			'<p class="detail-sizes"><strong>Sizes:</strong> ' + escapeHtml(getProductSizes(product)) + '</p>',
			'<div class="detail-actions">',
			'<a class="detail-button detail-button-secondary" href="catalog.html">Back to catalog</a>',
			'<button class="detail-button" type="button" onclick="alert(\'This item can be added to cart from the catalog page.\')">Add to cart</button>',
			'</div>',
			'</div>',
		].join('')

		const mainImage = detailRoot.querySelector('.detail-main-image')
		detailRoot.querySelectorAll('.detail-thumb').forEach(function (thumb) {
			thumb.addEventListener('click', function () {
				const nextImage = thumb.getAttribute('data-image') || ''
				detailRoot.querySelectorAll('.detail-thumb').forEach(function (item) {
					item.classList.toggle('is-active', item === thumb)
				})
				if (mainImage && nextImage) {
					mainImage.style.backgroundImage = 'linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.4)), url(' + nextImage + ')'
				}
			})
		})
	} catch (error) {
		detailRoot.innerHTML = '<p class="detail-empty">Unable to load product details.</p>'
		console.warn('Supabase product detail load failed:', error.message)
	}
}

window.ONEUMMAH = {
	db: db,
	escapeHtml: escapeHtml,
	formatPrice: formatPrice,
	fetchProducts: fetchProducts,
	fetchProductById: fetchProductById,
	renderHomeGrid: renderHomeGrid,
	renderCatalogGrid: renderCatalogGrid,
	filterProducts: filterProducts,
	applyCatalogFilter: applyCatalogFilter,
	mountProductLists: mountProductLists,
	mountProductDetail: mountProductDetail,
}

document.addEventListener('DOMContentLoaded', function () {
	wireFilterButtons()
	mountProductLists()
	mountProductDetail()
})