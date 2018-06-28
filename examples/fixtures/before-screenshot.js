/* eslint-disable no-undef */
'use strict';
module.exports = function () {
	return {
		contentType: 'text/html',
		content: `
        <html>
        	<head>
        		<style>
        			#hidden {
        				visibility: hidden;
        			}
        		</style>
        		<script type="text/javascript">
        			function showHiddenText() {
        				document.getElementById("hidden").style.visibility = "visible";
        			}
        		</script>
        	</head>
        	<body>
        		<button id="button" onclick="showHiddenText()">Show hidden text</button><br/>
        		<span id="hidden">I am hidden</span>
        	</body>
        </html>`,
		beforeScreenshot: () => {
			return new Promise(resolve => {
				setTimeout(() => {
					window.document.getElementById('button').click();
					setTimeout(() => {
						resolve();
					}, 0);
				}, 0);

			});
		}
	};
};
