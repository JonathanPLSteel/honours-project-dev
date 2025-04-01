import { Scene } from "phaser";
import { version } from "../menus/MainMenu";

export class EndScreen extends Scene {
    userInput: string = "";
    inputText: Phaser.GameObjects.Text;
    cursor: string = "|";

    constructor() {
        super("EndScreen");
    }

    create() {
        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 100,
            "Congratulations!\n\nYou have completed the game!",
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 32,
                color: "#000000",
                align: "center",
                wordWrap: { width: this.scale.width * 0.8 },
            }
        ).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 25,
            "Please enter your name and then press the ENTER key to save your score.",
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 24,
                color: "#000000",
                align: "center",
                wordWrap: { width: this.scale.width * 0.8 },
            }
        ).setOrigin(0.5);

        // Create a text object to display user input
        this.inputText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2 + 100, 
            "Enter Full Name: ", 
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 24,
                color: "#000000",
                align: "center",
            }
        ).setOrigin(0.5);

        this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
            if (event.key.length === 1) {
                this.userInput += event.key;
            } else if (event.key === "Backspace") {
                this.userInput = this.userInput.slice(0, -1);
            } else if (event.key === "Enter") {
                this.exportData();
            }

            this.inputText.setText(`Enter Full Name: ${this.userInput}${this.cursor}`);
        });

        // Blinking cursor effect
        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                this.cursor = this.cursor === "|" ? " " : "|";
                this.inputText.setText(`Enter Full Name: ${this.userInput}${this.cursor}`);
            },
        });
    }

    exportData() {
        this.sound.play("switch");
        
        let sanitizedUserInput = this.userInput.replace(/\s+/g, '');
    
        let filename = `ts-${version}-export-${sanitizedUserInput}-${new Date().toISOString()}-.csv`;

        console.log("Exporting data to CSV:", filename);

        this.exportLocalStorageToCSV(filename);

        let thank_you_text = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 200,
            "All done! Thank you for playing!",
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 24,
                color: "#000000",
                align: "center",
                wordWrap: { width: this.scale.width * 0.8 },
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: thank_you_text,
            alpha: 0,
            duration: 3000,
            ease: "Power1",
            yoyo: false,
            repeat: 0,
            onComplete: () => {
                this.scene.start("MainMenu");
            },
        });
    }

    exportLocalStorageToCSV(filename = "localStorageData.csv") {
        const data: Record<string, any>[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (!key) continue;

            const item = localStorage.getItem(key);
            if (!item) continue;

            try {
                const value = JSON.parse(item);
                
                if (typeof value === "object" && value !== null) {
                    value.level_id = key;
                    data.push(value);
                }
            } catch (e) {
                console.warn(`Skipping key "${key}" due to parsing error`, e);
            }
        }
    
        if (data.length === 0) {
            alert("No valid data found in localStorage.");
            return;
        }

        data.forEach((row) => {
            if (row.time_taken) {
                row.time_taken = row.time_taken.toFixed(2);
            }
        });

        data.sort((a, b) => a.level_id - b.level_id);

        console.log(data);
    
        const headers = Object.keys(data[0]);
    
        const csvRows = [
            headers.join(","),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] ?? "")).join(","))
        ];
    
        const csvString = csvRows.join("\n");
    
        const blob = new Blob([csvString], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }  
}