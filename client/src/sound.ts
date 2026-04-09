import {Game, Vec} from "./util";
import {Audio} from "@yandeu/audio/lib/audio/audio";

export class Sounds {
    public shoot?: Audio;
    public miss?: Audio;
    public carCrash?: Audio;
    public reload?: Audio;
    public hits: Audio[] = [];

    async init() {
        await Game.audio.load("shoot", "/shoot", 'mp3');
        await Game.audio.load("miss", "/miss", 'mp3')
        await Game.audio.load("reload", "/reload", 'mp3')
        await Game.audio.load("carCrash", "/car-crash", 'mp3')
        await Game.audio.load("hit1", "/hit1", 'mp3')
        await Game.audio.load("hit2", "/hit2", 'mp3')
        await Game.audio.load("hit3", "/hit3", 'mp3')

        this.shoot = await Game.audio.add("shoot")
        this.miss = await Game.audio.add("miss")
        this.reload = await Game.audio.add("reload")
        this.carCrash = await Game.audio.add("carCrash")
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

    playCarCrash(volume: number) {
        if (!this.carCrash) return;
        this.carCrash.setVolume(volume);
        this.carCrash.play();
        this.carCrash.isPlaying = false;
    }

    playReload() {
        if (!this.reload) return;
        this.reload.play();
    }

    calculateDistanceVolume(pos: Vec, range: number): number {
        const selfPos = Game.self!.getPos();

        const dx = Math.abs(pos.x - selfPos.x);
        const dy = Math.abs(pos.y - selfPos.y);
        const dz = Math.abs(pos.z - selfPos.z);

        if (dx > range || dy > range || dz > range) return 0;

        // 1.0 at center, quieter toward the edges
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return Math.max(0, 1 - dist / (5 * Math.sqrt(3))) * 0.5; // max 0.5, quieter the farther away
    }
}
