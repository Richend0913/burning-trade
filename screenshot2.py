import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

HP_DIR = Path(__file__).parent
options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=390,844")
options.add_argument("--force-device-scale-factor=2")
options.add_argument("--hide-scrollbars")

driver = webdriver.Chrome(options=options)

# Full page screenshots at different scroll positions
url = (HP_DIR / "index.html").as_uri()
driver.get(url)
time.sleep(2)

# Hero + stats
driver.set_window_size(390, 900)
driver.save_screenshot(str(HP_DIR / "ss_hero.png"))

# Scroll to charts
driver.execute_script("document.getElementById('chart').scrollIntoView()")
time.sleep(1)
driver.save_screenshot(str(HP_DIR / "ss_chart.png"))

# Scroll to daily
driver.execute_script("document.getElementById('daily').scrollIntoView()")
time.sleep(0.5)
driver.save_screenshot(str(HP_DIR / "ss_daily.png"))

# Scroll to join flow
driver.execute_script("document.getElementById('join').scrollIntoView()")
time.sleep(0.5)
driver.save_screenshot(str(HP_DIR / "ss_join.png"))

driver.quit()
print("done!")
