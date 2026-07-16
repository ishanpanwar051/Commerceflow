import os
import sys
import json
from mcp.server.fastmcp import FastMCP
from google import genai
from google.genai import types

mcp = FastMCP("Gemini Vision")

API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set", file=sys.stderr)
    sys.exit(1)

client = genai.Client(api_key=API_KEY)


@mcp.tool()
def describe_image(image_url: str, prompt: str = "Describe this image in detail") -> str:
    """Analyze an image using Gemini Vision API.
    
    Args:
        image_url: URL of the image to analyze
        prompt: Question or instruction about the image (default: describe in detail)
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt, image_url],
        )
        return response.text
    except Exception as e:
        return f"Error analyzing image: {str(e)}"


@mcp.tool()
def identify_objects(image_url: str) -> str:
    """Identify objects, people, text, and elements in an image.
    
    Args:
        image_url: URL of the image to analyze
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=["List all objects, text, and elements visible in this image. Be specific and detailed.", image_url],
        )
        return response.text
    except Exception as e:
        return f"Error identifying objects: {str(e)}"


if __name__ == "__main__":
    mcp.run(transport="stdio")
