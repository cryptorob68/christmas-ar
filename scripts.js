// virtual grid
AFRAME.registerComponent('yard-grid', {
    init: function() {
        const scene = this.el.sceneEl.object3D;
        
        // Create grid material
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            opacity: 0.5,
            transparent: true
        });

        // Create larger grid
        const gridSize = 30; // 30-foot width
        const gridDivisions = 30; // 1-foot squares
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ff00, 0x00ff00);
        
        // Move grid to ground level
        gridHelper.position.y = 0.01; // Slightly above ground to be visible
        
        scene.add(gridHelper);
    }
});

AFRAME.registerComponent('fix-aspect', {
    schema: {
        width: {type: 'number', default: 1},
        height: {type: 'number', default: 1}
    },

    init: function() {
        this.camera = document.querySelector('[camera]');
        this.updateScale = this.updateScale.bind(this);
        window.addEventListener('resize', this.updateScale);
        setTimeout(this.updateScale, 100);
    },

    updateScale: function() {
        const el = this.el;
        const data = this.data;
        const camera = this.camera;

        if (!el || !camera) return;

        const cameraPos = camera.getAttribute('position');
        const position = el.getAttribute('position');
        const distance = position.z - cameraPos.z;

        const fov = 2 * Math.atan(1 / camera.components.camera.data.fov);
        const scale = Math.abs(distance * Math.tan(fov));

        el.setAttribute('scale', `${scale} ${scale} ${scale}`);
    }
});

// ... keep your existing snow component below this ...

// Add this new component for snow
AFRAME.registerComponent('snow', {
    init: function() {
        this.snowflakes = [];
        this.createSnow();
    },

    createSnow: function() {
        const scene = this.el.sceneEl.object3D;
        
        // Create snowflake material
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });

        // Create snowflakes
        const snowGeo = new THREE.BufferGeometry();
        const positions = [];

        // Create 1000 snowflakes
        for (let i = 0; i < 1000; i++) {
            positions.push(
                Math.random() * 10 - 5, // x between -5 and 5
                Math.random() * 5 + 2,  // y between 2 and 7
                Math.random() * 10 - 5  // z between -5 and 5
            );
        }

        snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.snow = new THREE.Points(snowGeo, snowMaterial);
        scene.add(this.snow);

        // Store initial positions for animation
        this.initialPositions = positions.slice();
    },

    tick: function(time, deltaTime) {
        if (!this.snow) return;

        const positions = this.snow.geometry.attributes.position.array;

        // Animate each snowflake
        for (let i = 0; i < positions.length; i += 3) {
            // Move snowflake down
            positions[i + 1] -= deltaTime * 0.001; // Y position

            // Add slight horizontal movement
            positions[i] += Math.sin(time * 0.001 + i) * 0.001; // X position
            
            // Reset snowflake to top when it falls below ground
            if (positions[i + 1] < 0) {
                positions[i] = this.initialPositions[i];     // Reset X
                positions[i + 1] = this.initialPositions[i + 1]; // Reset Y
                positions[i + 2] = this.initialPositions[i + 2]; // Reset Z
            }
        }

        this.snow.geometry.attributes.position.needsUpdate = true;
    }
});
