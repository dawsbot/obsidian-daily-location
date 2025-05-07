const { Plugin } = require('obsidian');

module.exports = class DailyLocationPlugin extends Plugin {
  async onload() {
    this.registerEvent(
      this.app.vault.on("create", async (file) => {
        const dailyNotePath = this.getTodayDailyNotePath();
        if (file.path === dailyNotePath) {
          const location = await this.getLocation();
          if (location) {
            const content = await this.app.vault.read(file);
            const updatedContent = `📍 ${location}\n\n${content}`;
            await this.app.vault.modify(file, updatedContent);

            // Move cursor to line 3 (i.e., after location + empty line)
            const leaf = this.app.workspace.getLeafById(file.path) || this.app.workspace.getMostRecentLeaf();
            if (leaf) {
              await leaf.openFile(file);
              const editor = leaf.view.editor;
              if (editor) {
                editor.setCursor({ line: 2, ch: 0 });
              }
            }
          }
        }
      })
    );
  }

  getTodayDailyNotePath() {
    const dailySettings = this.app.internalPlugins.plugins["daily-notes"].instance.options;
    const folder = dailySettings.folder;
    const format = dailySettings.format;
    const filename = window.moment().format(format);
    return `${folder}/${filename}.md`;
  }

  async getLocation() {
    try {
      const response = await fetch("https://ipinfo.io/json"); // Replace with your real token
      const data = await response.json();
      const { city, region, country } = data;
      return `${city}, ${region}, ${country}`;
    } catch (e) {
      console.error("Failed to fetch location", e);
      return null;
    }
  }
};
