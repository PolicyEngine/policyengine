from flask import request


def add_social_card_metadata(path: str, html: str) -> str:
    """Modifies index.html to include social card metadata.

    Args:
        path (str): The path requested in the URL.
        html (str): The HTML to modify.

    Returns:
        str: The modified HTML.
    """

    if "/uk" in path:
        country = "UK"
    elif "/us" in path:
        country = "US"
    else:
        country = None

    image_url = {
        "UK": "/social_preview/uk.png",
        "US": "/social_preview/us.png",
        None: "/social_preview/global.png",
    }[country]

    image_url = request.host_url + image_url

    title = {
        "UK": "PolicyEngine UK",
        "US": "PolicyEngine US",
        None: "PolicyEngine",
    }[country]

    description = {
        "UK": "Compute the impacts of public policy for the UK and your household",
        "US": "Compute the impacts of public policy for your household.",
        None: "Compute the impacts of public policy.",
    }[country]

    placeholder = "<title>PolicyEngine</title>"
    replacement = f"""<title>{title}</title>
<meta name="title" content="{title}">
<meta name="description" content="{description}">
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="{title}">
<meta property="twitter:description" content="{description}">
<meta property="twitter:image" content="{image_url}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:image" content="{image_url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">

<!-- Twitter -->
<link rel="apple-touch-icon" href="/logo192.png" />"""

    return html.replace(placeholder, replacement)
