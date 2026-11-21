/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Safe article lookup by hash ID (prevents selector errors on malformed hashes).
		var getArticleById = function(id) {
			if (!id || !/^[a-zA-Z0-9_-]+$/.test(id))
				return $();

			return $main_articles.filter(function() {
				return this.id === id;
			});
		};

	// Safe programmatic focus helper (avoids unwanted scroll jumps).
		var focusWithoutScroll = function(element) {
			if (!element || typeof element.focus !== 'function')
				return;

			try {
				element.focus({ preventScroll: true });
			} catch (err) {
				element.focus();
			}
		};

	// Play initial animations as soon as the DOM is ready (no waiting for lazy images/iframes).
		$(function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Nav.
		var $nav = $header.children('nav'),
			$nav_li = $nav.find('li');

		// Add "middle" alignment classes if we're dealing with an even number of items.
			if ($nav_li.length % 2 == 0) {

				$nav.addClass('use-middle');
				$nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

			}

	// Main.
		var	delay = 325,
			locked = false,
			currentId = null,
			lastFocusedElement = null,
			timers = [];

		var clearTimers = function() {
			for (var i = 0; i < timers.length; i++)
				clearTimeout(timers[i]);
			timers = [];
		};

		var schedule = function(fn, ms) {
			timers.push(setTimeout(fn, ms));
		};

		var restoreFocus = function() {
			if (lastFocusedElement
			&&	lastFocusedElement !== document.body
			&&	document.contains(lastFocusedElement))
				focusWithoutScroll(lastFocusedElement);

			lastFocusedElement = null;
		};

		// Methods.
			$main._show = function(id, initial) {

				var $article = getArticleById(id);

				// No such article? Bail.
					if ($article.length == 0)
						return;

				// Already showing or transitioning to this article? Bail.
					if (currentId === id && $body.hasClass('is-article-visible'))
						return;

				// Remember trigger element when leaving the home view.
					if (!$body.hasClass('is-article-visible') && document.activeElement)
						lastFocusedElement = document.activeElement;

				currentId = id;
				clearTimers();

				// Handle lock.

					// Already locked? Speed through "show" steps w/o delays.
						if (locked || (typeof initial != 'undefined' && initial === true)) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Mark as visible.
								$body.addClass('is-article-visible');

							// Deactivate and hide all articles (just in case one's already active).
								$main_articles.removeClass('active').hide();

							// Hide header, footer.
								$header.hide();
								$footer.hide();

							// Show main, article.
								$main.show();
								$article.show();

							// Activate article.
								$article.addClass('active');

							// Move focus into article for keyboard/screen-reader accessibility.
								focusWithoutScroll($article[0]);

							// Unlock.
								locked = false;

							// Unmark as switching.
								schedule(function() {
									$body.removeClass('is-switching');
								}, (initial ? 1000 : 0));

							return;

						}

					// Lock.
						locked = true;

				// Article already visible? Just swap articles.
					if ($body.hasClass('is-article-visible')) {

						// Deactivate current article.
							var $currentArticle = $main_articles.filter('.active');

							$currentArticle.removeClass('active');

						// Show article.
							schedule(function() {

								// Hide current article.
									$currentArticle.hide();

								// Show article.
									$article.show();

								// Activate article.
									schedule(function() {

										$article.addClass('active');

										// Window stuff & focus.
											$window.scrollTop(0);
											focusWithoutScroll($article[0]);

										// Unlock.
											schedule(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

				// Otherwise, handle as normal.
					else {

						// Mark as visible.
							$body
								.addClass('is-article-visible');

						// Show article.
							schedule(function() {

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									schedule(function() {

										$article.addClass('active');

										// Window stuff & focus.
											$window.scrollTop(0);
											focusWithoutScroll($article[0]);

										// Unlock.
											schedule(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

			};

			$main._hide = function(addState) {

				var $article = $main_articles.filter('.active');

				// Article not visible? Bail.
					if (!$body.hasClass('is-article-visible') || currentId === null)
						return;

				currentId = null;
				clearTimers();

				// Add clean URL state (no trailing '#') when closed via UI.
					if (typeof addState != 'undefined'
					&&	addState === true)
						history.pushState(null, '', location.pathname + location.search);

				// Handle lock.

					// Already locked? Speed through "hide" steps w/o delays.
						if (locked) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Deactivate and hide all articles.
								$main_articles.removeClass('active').hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								$body.removeClass('is-article-visible');

							// Unlock.
								locked = false;

							// Unmark as switching.
								$body.removeClass('is-switching');

							// Window stuff & focus restoration.
								$window.scrollTop(0);
								restoreFocus();

							return;

						}

					// Lock.
						locked = true;

				// Deactivate article.
					$article.removeClass('active');

				// Hide article.
					schedule(function() {

						// Hide articles, main.
							$main_articles.hide();
							$main.hide();

						// Show footer, header.
							$footer.show();
							$header.show();

						// Unmark as visible.
							schedule(function() {

								$body.removeClass('is-article-visible');

								// Window stuff & focus restoration.
									$window.scrollTop(0);
									restoreFocus();

								// Unlock.
									schedule(function() {
										locked = false;
									}, delay);

							}, 25);

					}, delay);

			};

		// Language detection for dynamically injected close controls.
			var isEnglish = ((document.documentElement.lang || '').toLowerCase().indexOf('en') === 0)
				|| (location.pathname.toLowerCase().indexOf('index_en') !== -1),
				closeLabel = isEnglish ? 'Close' : 'Cerrar',
				backLabel = isEnglish ? 'Back to home' : 'Volver al inicio';

		// Articles.
			$main_articles.each(function() {

				var $this = $(this);

				// Allow programmatic focus for keyboard accessibility.
					$this.attr('tabindex', '-1');

				// Top close button (accessible <button>).
					$('<button type="button" class="close"></button>')
						.text(closeLabel)
						.attr('aria-label', closeLabel)
						.appendTo($this)
						.on('click', function() {
							$main._hide(true);
						});

				// Bottom close button (avoids scrolling back to top on long sections in mobile).
					$('<div class="article-actions"></div>')
						.append(
							$('<button type="button" class="close-bottom"></button>')
								.text(backLabel)
								.on('click', function() {
									$main._hide(true);
								})
						)
						.appendTo($this);

				// Prevent clicks from inside article from bubbling.
					$this.on('click', function(event) {
						event.stopPropagation();
					});

			});

		// Events.
			$body.on('click', function() {

				// Article visible? Hide.
					if ($body.hasClass('is-article-visible'))
						$main._hide(true);

			});

			$window.on('keyup', function(event) {

				if (event.key === 'Escape' || event.keyCode === 27) {

					// Article visible? Hide.
						if ($body.hasClass('is-article-visible'))
							$main._hide(true);

				}

			});

			var syncFromHash = function() {
				var id = location.hash ? location.hash.slice(1) : '';

				// Empty hash? Hide if an article is currently visible.
					if (id === '') {
						$main._hide();
					}
				// Matching article? Show it (idempotent if already active).
					else if (getArticleById(id).length > 0) {
						$main._show(id);
					}
			};

			$window.on('hashchange popstate', syncFromHash);

		// Scroll restoration.
		// This prevents the page from scrolling back to the top on a hashchange.
			if ('scrollRestoration' in history)
				history.scrollRestoration = 'manual';
			else {

				var	oldScrollPos = 0,
					scrollPos = 0,
					$htmlbody = $('html,body');

				$window
					.on('scroll', function() {

						oldScrollPos = scrollPos;
						scrollPos = $htmlbody.scrollTop();

					})
					.on('hashchange', function() {
						$window.scrollTop(oldScrollPos);
					});

			}

		// Initialize.

			// Hide main, articles.
				$main.hide();
				$main_articles.hide();

			// Initial article.
				if (location.hash != ''
				&&	location.hash != '#')
					$(function() {
						$main._show(location.hash.slice(1), true);
					});

})(jQuery);
