import {Game} from "./util";
import {Audio} from "@yandeu/audio/lib/audio/audio";

export class Sounds {
    public shoot?: Audio;
    public miss?: Audio;
    public hits: Audio[] = [];

    async init() {
        await Game.audio.load("shoot", "/shoot", 'mp3');
        await Game.audio.load("miss", "/miss", 'mp3')
        await Game.audio.load("hit1", "/hit1", 'mp3')
        await Game.audio.load("hit2", "/hit2", 'mp3')
        await Game.audio.load("hit3", "/hit3", 'mp3')

        this.shoot = await Game.audio.add("shoot")
        this.miss = await Game.audio.add("miss")
        this.hits.push(await Game.audio.add("hit1"))
        this.hits.push(await Game.audio.add("hit2"))
        this.hits.push(await Game.audio.add("hit3"))
    }

    playShoot() {
        if (!this.shoot) return;
        this.shoot.detune = Math.random() * 350;
        this.shoot.play();
        this.shoot.isPlaying = false;
    }

    playHit() {
        if (this.hits.length == 0) return;
        let item = this.hits[Math.floor(Math.random() * this.hits.length)];
        item.play();
        item.isPlaying = false;
    }

    playMiss(volume: number) {
        if (!this.miss) return;

        this.miss.detune = Math.random() * 350;
        this.miss.setVolume(volume);
        this.miss.play();
        this.miss.isPlaying = false;
    }
}
