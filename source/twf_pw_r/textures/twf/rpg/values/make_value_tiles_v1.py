import pygame
import sys
import math

# Initialize Pygame
pygame.init()

# --- Configuration ---
WIDTH, HEIGHT = 128, 128 # Dimensions of the image
CENTER = (WIDTH // 2, HEIGHT // 2)
RADIUS = WIDTH // 2 - 8  # Set radius slightly smaller than the width to avoid clipping

BG_COLOR = (50, 50, 50)  # Dark gray background
TEXT_COLOR = (255, 255, 255)  # White text
FONT_SIZE = 72

# --- Set up the font ---
# The default font is used here, but you can specify a file path for a custom font.
try:
    font = pygame.font.Font(None, FONT_SIZE)
except pygame.error as e:
    print(f"Font loading error: {e}")
    pygame.quit()
    sys.exit()

# Define the ratio for the first segment (as a decimal)
# The second segment's ratio will be 1.0 - FIRST_SEGMENT_RATIO
FIRST_SEGMENT_RATIO = 0.75
if not 0 <= FIRST_SEGMENT_RATIO <= 1:
    print("Warning: FIRST_SEGMENT_RATIO must be between 0 and 1. Using 0.5 instead.")
    FIRST_SEGMENT_RATIO = 0.5

# Define the colors for the two segments
SEGMENT_COLORS = [(255, 100, 0, 255), (0, 0, 0, 255)]  # Orange and transparent

rainbow_colors1 = [
    (255, 0, 0, 255),       # Red
    (255, 51, 0, 255),
    (255, 102, 0, 255),
    (255, 153, 0, 255),     # Orange
    (255, 204, 0, 255),
    (255, 255, 0, 255),     # Yellow
    (204, 255, 0, 255),
    (153, 255, 0, 255),
    (102, 255, 0, 255),
    (51, 255, 0, 255),
    (0, 255, 0, 255),       # Green
    (0, 204, 51, 255),
    (0, 153, 102, 255),
    (0, 102, 153, 255),
    (0, 51, 204, 255),
    (0, 0, 255, 255),       # Blue
    (75, 0, 130, 255),      # Indigo
    (101, 0, 157, 255),
    (127, 0, 184, 255),
    (148, 0, 211, 255)      # Violet
]

rainbow_colors = [
    (255, 0, 0, 255),       # Red
    (255, 32, 0, 255),
    (255, 64, 0, 255),
    (255, 96, 0, 255),
    (255, 128, 0, 255),
    (255, 160, 0, 255),
    (255, 192, 0, 255),
    (255, 224, 0, 255),
    (255, 255, 0, 255),     # Yellow
    (192, 255, 0, 255),
    (128, 255, 0, 255),
    (64, 255, 0, 255),
    (0, 255, 0, 255),       # Green
    (0, 255, 64, 255),
    (0, 255, 128, 255),
    (0, 255, 192, 255),
    (0, 255, 255, 255),
    (0, 192, 255, 255),
    (0, 128, 255, 255),
    (0, 64, 255, 255),
    (0, 0, 255, 255)        # Blue
]



def draw_pie_segment(surface, color, center, radius, start_angle, end_angle):
    """
    Draws a filled pie segment on the surface.

    Args:
        surface: The Pygame surface to draw on.
        color: The color of the segment (RGB tuple).
        center: The center coordinates of the pie.
        radius: The radius of the pie.
        start_angle: The starting angle in degrees (clockwise from positive x-axis).
        end_angle: The ending angle in degrees.
    """
    # Create a list of vertices for the polygon
    points = [center]
    
    # We use a loop to create multiple points along the arc for a smooth curve.
    num_points = 150
    for i in range(num_points + 1):
        angle = math.radians(start_angle + (end_angle - start_angle) * i / num_points)
        x = center[0] + radius * math.cos(angle)
        y = center[1] + radius * math.sin(angle)
        points.append((x, y))
    
    # Draw the filled polygon, connecting all the points
    pygame.draw.polygon(surface, color, points)


# --- Draw the two pie segments ---

# Calculate the angles for the first and second segments
MAX = 20

for i in range(0, MAX+1):
    # --- Create a transparent surface ---
    surface = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    surface_text = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    
    start = 270

    start_angle_1 = start
    end_angle_1 = start + i * 360 / MAX

    # Draw the first segment
    draw_pie_segment(surface, SEGMENT_COLORS[1], ((WIDTH // 2)+4, (HEIGHT // 2) + 4), RADIUS, 0, 360) # Black basestring
    draw_pie_segment(surface, BG_COLOR, ((WIDTH // 2)+2, (HEIGHT // 2) + 2), RADIUS, start_angle_1, end_angle_1)
    draw_pie_segment(surface, rainbow_colors[i%len(rainbow_colors)], CENTER, RADIUS, start_angle_1, end_angle_1)
    

    # 1. Convert the number to a string and render it to a new surface.
    #    The `True` flag enables anti-aliasing for smoother text.
    text_surface1 = font.render(str(i), True, BG_COLOR)
    text_surface = font.render(str(i), True, TEXT_COLOR)

    # 2. Get the rectangular dimensions of the text surface.
    text_rect = text_surface.get_rect()    

    # 3. Center the text rect on the screen's rect.
    #    `screen.get_rect()` gets a rect that represents the entire window.
    #    The `.center` property is a powerful way to align surfaces.
    text_rect.center = surface.get_rect().center

    # 4. Blit (draw) the rendered text surface onto the screen at the calculated position.
    surface.blit(text_surface1, text_rect)
    surface_text.blit(text_surface1, text_rect)
    text_rect.centerx -= 2
    text_rect.centery -= 2
    surface.blit(text_surface, text_rect)
    surface_text.blit(text_surface, text_rect)

    # --- Save the surface to a PNG file ---
    try:
        OUTPUT_FILENAME = "pie"+str(i)+".png"
        pygame.image.save(surface, OUTPUT_FILENAME)
        print(f"Successfully saved pie chart image to {OUTPUT_FILENAME}")
        # OUTPUT_FILENAME = "num"+str(i)+".png"
        # pygame.image.save(surface_text, OUTPUT_FILENAME)
        # print(f"Successfully saved pie chart image to {OUTPUT_FILENAME}")

    except pygame.error as e:
        print(f"Error saving image: {e}")


for i in range(0, 100):
    surface_text = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)    
    text_surface1 = font.render(str(i), True, BG_COLOR)
    text_surface = font.render(str(i), True, TEXT_COLOR)
    text_rect = text_surface.get_rect()
    text_rect.center = surface.get_rect().center

    # 4. Blit (draw) the rendered text surface onto the screen at the calculated position.
    surface.blit(text_surface1, text_rect)
    surface_text.blit(text_surface1, text_rect)
    text_rect.centerx -= 2
    text_rect.centery -= 2
    surface.blit(text_surface, text_rect)
    surface_text.blit(text_surface, text_rect)
    OUTPUT_FILENAME = "num"+str(i)+".png"    
    try:
        pygame.image.save(surface_text, OUTPUT_FILENAME)
        print(f"Successfully saved pie chart image to {OUTPUT_FILENAME}")
    except pygame.error as e:
        print(f"Error saving image: {e}")    
        
        
# Quit Pygame
pygame.quit()
sys.exit()
        