namespace SpriteKind {
    export const player_projectile = SpriteKind.create()
    export const enemy_projectile = SpriteKind.create()
}
sprites.onOverlap(SpriteKind.player_projectile, SpriteKind.Enemy, function (proj, enemy) {
    info.changeScoreBy(100)
    enemy.destroy()
    enemy_count += -1
})
function hit_edge (sprite: Sprite) {
    transformSprites.changeRotation(sprite, 180)
}
function calculate_velocity (direction_sprite: Sprite, sprite: Sprite, speed: number) {
    direction = transformSprites.getRotation(direction_sprite)
    direction = spriteutils.degreesToRadians(direction)
    sprite.vx = Math.sin(direction) * speed
    sprite.vy = Math.cos(direction) * (speed * -1)
}
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    hit_edge(sprite)
})
function fire (sprite: Sprite, speed: number, kind: number) {
    proj = sprites.create(assets.image`projectile`, kind)
    proj.setFlag(SpriteFlag.DestroyOnWall, true)
    proj.setPosition(sprite.x, sprite.y)
    calculate_velocity(sprite, proj, speed)
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    fire(player_plane, projectile_speed, SpriteKind.player_projectile)
})
sprites.onOverlap(SpriteKind.enemy_projectile, SpriteKind.Player, function (proj, player2) {
    proj.destroy()
    info.changeLifeBy(-1)
})
function enemy_behaviour (enemy: Sprite) {
    if (spriteutils.distanceBetween(enemy, player_plane) > 80) {
        far_from_player(enemy)
    } else if (spriteutils.distanceBetween(enemy, player_plane) < 40) {
        sprites.setDataNumber(enemy, "turn", enemy_turn)
    } else {
        sprites.setDataNumber(enemy, "turn", 0)
    }
    transformSprites.changeRotation(enemy, sprites.readDataNumber(enemy, "turn"))
    calculate_velocity(enemy, enemy, enemy_speed)
    if (randint(1, 150) == 1) {
        fire(enemy, projectile_speed - 50, SpriteKind.enemy_projectile)
    }
}
scene.onHitWall(SpriteKind.Enemy, function (sprite, location) {
    hit_edge(sprite)
})
function player_controls () {
    if (controller.up.isPressed()) {
        transformSprites.changeRotation(player_plane, player_turn * -1)
    } else if (controller.down.isPressed()) {
        transformSprites.changeRotation(player_plane, player_turn)
    }
    calculate_velocity(player_plane, player_plane, player_speed)
}
function new_wave () {
    for (let index = 0; index < wave; index++) {
        spawn_enemy()
    }
    message = textsprite.create("NEW WAVE")
    message.setOutline(1, 15)
    message.setFlag(SpriteFlag.RelativeToCamera, true)
    message.setPosition(80, 40)
    message.lifespan = 3000
    wave += 1
}
function get_dir_to_player (enemy: Sprite) {
    target_dir = spriteutils.angleFrom(enemy, player_plane)
    target_dir = spriteutils.radiansToDegrees(target_dir) + 90
    return target_dir
}
function far_from_player (enemy: Sprite) {
    if (get_dir_to_player(enemy) - transformSprites.getRotation(enemy) < 3) {
        sprites.setDataNumber(enemy, "turn", enemy_turn * -1)
    }
    if (get_dir_to_player(enemy) - transformSprites.getRotation(enemy) > 3) {
        sprites.setDataNumber(enemy, "turn", enemy_turn)
    }
}
function spawn_enemy () {
    enemy = sprites.create(assets.image`enemy`, SpriteKind.Enemy)
    sprites.setDataNumber(enemy, "turn", 0)
    place_sprite(enemy)
    transformSprites.rotateSprite(enemy, get_dir_to_player(enemy))
    enemy_count += 1
}
function place_sprite (sprite: Sprite) {
    col = randint(1, grid.numColumns())
    row = randint(1, grid.numRows())
    tiles.placeOnTile(sprite, tiles.getTileLocation(col, row))
    if (spriteutils.distanceBetween(sprite, player_plane) < 120) {
        place_sprite(sprite)
    }
}
let row = 0
let col = 0
let enemy: Sprite = null
let target_dir = 0
let message: TextSprite = null
let proj: Sprite = null
let direction = 0
let wave = 0
let player_plane: Sprite = null
let enemy_turn = 0
let enemy_speed = 0
let projectile_speed = 0
let player_turn = 0
let player_speed = 0
player_speed = 50
player_turn = 3
projectile_speed = 150
enemy_speed = 50
enemy_turn = 3
player_plane = sprites.create(assets.image`player`, SpriteKind.Player)
transformSprites.rotateSprite(player_plane, 90)
scene.setBackgroundColor(9)
tiles.setCurrentTilemap(tilemap`level`)
scene.cameraFollowSprite(player_plane)
let enemy_count = 0
wave = 1
let enemy_count_sprite = textsprite.create("")
enemy_count_sprite.setOutline(1, 15)
enemy_count_sprite.setFlag(SpriteFlag.RelativeToCamera, true)
enemy_count_sprite.bottom = 120
enemy_count_sprite.left = 0
game.onUpdate(function () {
    player_controls()
    if (enemy_count < 1) {
        new_wave()
    }
    enemy_count_sprite.setText("Enemy count: " + enemy_count)
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        enemy_behaviour(value)
    }
})
