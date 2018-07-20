/* eslint-disable no-undef */
'use strict';
module.exports = function (params) {
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
        		<span id="hidden">${params.text}</span>
        	</body>
        </html>`,
		beforeScreenshot: () => {
			return new Promise(resolve => {
				window.document.getElementById('button').click();
				setTimeout(resolve, 10);
			});
		}
	};
};
