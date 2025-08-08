import * as THREE from 'three';

class CoinTossGame {
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private coin!: THREE.Mesh;
	private tossing: boolean = false;
	private tossStart: number = 0;
	private tossDuration: number = 1000;
	private targetRotation: number = 0;
	private resultText: HTMLElement;
	private betButtons: THREE.Mesh[] = [];
	// private betButtonTextures: THREE.Texture[] = []; // Не используется
	private result: 'heads' | 'tails' | 'edge' = 'heads';
	private userBet: 'heads' | 'tails' | 'edge' | null = null;
	private balance: number = 1000;
	private betAmount: number = 10;
	private balanceElement: HTMLElement;
	// private betInfoElement: HTMLElement; // Не используется

	constructor() {
		this.scene = new THREE.Scene();
		// Камера смотрит сверху вниз с лучшим обзором
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(0, 6, 4);
		this.camera.lookAt(0, 0, 0);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0x1a1a1a);
		document.body.appendChild(this.renderer.domElement);

		this.resultText = document.getElementById('result')!;
		this.balanceElement = document.getElementById('balance')!;
		// this.betInfoElement = document.getElementById('bet-info')!; // Не используется

		this.setupLighting();
		this.createCoin();
		this.createBetButtons();
		this.setupEventListeners();
		this.animate();
	}

	private setupLighting(): void {
		// Основное освещение сверху (увеличена яркость)
		const light = new THREE.DirectionalLight(0xffffff, 1.0);
		light.position.set(0, 10, 0);
		this.scene.add(light);

		// Дополнительное освещение для теней (увеличена яркость)
		const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
		this.scene.add(ambientLight);

		// Добавляем поверхность для отражения
		const surfaceGeometry = new THREE.PlaneGeometry(10, 10);
		const surfaceMaterial = new THREE.MeshStandardMaterial({
			color: 0x333333,
			roughness: 0.8,
			metalness: 0.1
		});
		const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
		surface.rotation.x = -Math.PI / 2;
		surface.position.y = -1.1;
		this.scene.add(surface);
	}

	private createCoin(): void {
		const coinRadius = 1;
		const coinHeight = 0.1;

		const coinGeometry = new THREE.CylinderGeometry(coinRadius, coinRadius, coinHeight, 64);

		// Загружаем текстуры для орла и решки
		const textureLoader = new THREE.TextureLoader();
		const headsTexture = textureLoader.load('/textures/heads.png');
		const tailsTexture = textureLoader.load('/textures/tails.png');

		// Поворачиваем текстуры по центру
		headsTexture.center.set(0.5, 0.5);
		tailsTexture.center.set(0.5, 0.5);
		headsTexture.rotation = Math.PI;
		tailsTexture.rotation = Math.PI;

		// Настраиваем материалы для цилиндра
		// Материалы применяются в следующем порядке: [боковая сторона, верхняя сторона, нижняя сторона]
		const coinMaterials = [
			new THREE.MeshBasicMaterial({
				color: 0xcccccc
			}), // Боковая сторона
			new THREE.MeshBasicMaterial({
				map: headsTexture,
				color: 0xffffff // Белый цвет для яркости
			}), // Верхняя сторона (орёл)
			new THREE.MeshBasicMaterial({
				map: tailsTexture,
				color: 0xffffff // Белый цвет для яркости
			}) // Нижняя сторона (решка)
		];

		this.coin = new THREE.Mesh(coinGeometry, coinMaterials);
		// Начальная ориентация - монетка лежит горизонтально
		this.coin.rotation.x = 0; // Начинаем с горизонтального положения
		this.coin.position.y = 0;
		this.scene.add(this.coin);
	}

	private createBetButtons(): void {
		const textureLoader = new THREE.TextureLoader();

		// Загружаем текстуры кнопок
		const headsBtnTexture = textureLoader.load('/textures/heads-btn.png');
		const tailsBtnTexture = textureLoader.load('/textures/tails-btn.png');
		const edgeBtnTexture = textureLoader.load('/textures/edge-btn.png');

		// this.betButtonTextures = [headsBtnTexture, tailsBtnTexture, edgeBtnTexture]; // Не используется

		// Создаем геометрию для кнопок (плоские прямоугольники)
		const buttonGeometry = new THREE.PlaneGeometry(1, 1); // Уменьшаем размер

		// Создаем материалы для кнопок с текстурами и яркими цветами
		const headsMaterial = new THREE.MeshBasicMaterial({
			map: headsBtnTexture,
			transparent: true,
			side: THREE.DoubleSide,
			color: 0xffffff // Белый цвет для яркости
		});
		const tailsMaterial = new THREE.MeshBasicMaterial({
			map: tailsBtnTexture,
			transparent: true,
			side: THREE.DoubleSide,
			color: 0xffffff // Белый цвет для яркости
		});
		const edgeMaterial = new THREE.MeshBasicMaterial({
			map: edgeBtnTexture,
			transparent: true,
			side: THREE.DoubleSide,
			color: 0xffffff // Белый цвет для яркости
		});

		// Создаем кнопки
		const headsButton = new THREE.Mesh(buttonGeometry, headsMaterial);
		const tailsButton = new THREE.Mesh(buttonGeometry, tailsMaterial);
		const edgeButton = new THREE.Mesh(buttonGeometry, edgeMaterial);

		// Тестовые кнопки убраны - текстуры работают

		// Позиционируем кнопки ближе к камере
		headsButton.position.set(-2, 0, 2);
		edgeButton.position.set(0, 0, 2); // Ребро по центру
		tailsButton.position.set(2, 0, 2);

		// Поворачиваем кнопки лицом к камере
		headsButton.rotation.x = -Math.PI / 2;
		tailsButton.rotation.x = -Math.PI / 2;
		edgeButton.rotation.x = -Math.PI / 2;

		// Отладочная информация
		console.log('Основные кнопки созданы:', this.betButtons.length);
		console.log(
			'Позиции основных кнопок:',
			this.betButtons.map((btn) => btn.position)
		);

		// Добавляем кнопки в сцену
		this.scene.add(headsButton);
		this.scene.add(tailsButton);
		this.scene.add(edgeButton);

		this.betButtons = [headsButton, edgeButton, tailsButton];

		// Отладочная информация
		console.log('Кнопки созданы:', this.betButtons.length);
		console.log(
			'Позиции кнопок:',
			this.betButtons.map((btn) => btn.position)
		);
	}

	private setupEventListeners(): void {
		window.addEventListener('click', (event) => this.handleClick(event));
		window.addEventListener('resize', () => this.onWindowResize());
	}

	private handleClick(event: MouseEvent): void {
		if (this.tossing) return;

		// Получаем координаты мыши в нормализованных координатах (-1 до 1)
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		// Создаем луч для определения пересечения
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		// Проверяем пересечение с кнопками
		const intersects = raycaster.intersectObjects(this.betButtons);

		if (intersects.length > 0) {
			const clickedButton = intersects[0].object;
			const buttonIndex = this.betButtons.indexOf(clickedButton as THREE.Mesh);

			if (buttonIndex === 0) {
				this.makeBet('heads');
			} else if (buttonIndex === 1) {
				this.makeBet('edge');
			} else if (buttonIndex === 2) {
				this.makeBet('tails');
			}
		}
	}

	private makeBet(bet: 'heads' | 'tails' | 'edge'): void {
		if (this.tossing) return;
		if (this.balance < this.betAmount) {
			alert('Недостаточно средств для ставки!');
			return;
		}

		this.userBet = bet;
		this.balance -= this.betAmount;
		this.updateBalanceDisplay();
		this.disableBettingButtons();
		this.tossCoin();
	}

	private updateBalanceDisplay(): void {
		this.balanceElement.textContent = `Баланс: ${this.balance}`;
	}

	private calculatePayout(): number {
		if (!this.userBet || this.userBet !== this.result) {
			return 0; // Проигрыш
		}

		if (this.result === 'edge') {
			return this.betAmount * 48.5; // Выплата за ребро
		} else {
			return this.betAmount * 1.98; // Выплата за орла/решку
		}
	}

	private disableBettingButtons(): void {
		// Делаем кнопки полупрозрачными
		this.betButtons.forEach((button) => {
			(button.material as THREE.MeshBasicMaterial).opacity = 0.5;
		});
	}

	private enableBettingButtons(): void {
		// Возвращаем полную прозрачность кнопкам
		this.betButtons.forEach((button) => {
			(button.material as THREE.MeshBasicMaterial).opacity = 1.0;
		});
	}

	private tossCoin(): void {
		if (this.tossing) return;

		this.tossing = true;
		this.tossStart = performance.now();

		// Случайно выбираем результат с заданными вероятностями
		const rand = Math.random();
		if (rand < 0.49) {
			this.result = 'heads'; // Орёл - 49%
		} else if (rand < 0.98) {
			this.result = 'tails'; // Решка - 49%
		} else {
			this.result = 'edge'; // Ребро - 2%
		}

		// Ровно 1 полный оборот
		const baseRotation = 2 * Math.PI;

		// Случайный наклон для реалистичности (только для ребра)
		// const tiltAngle = ((Math.random() - 0.5) * Math.PI) / 6; // ±15 градусов - не используется

		if (this.result === 'heads') {
			// Докручиваем до четкого положения орла (0 градусов)
			this.targetRotation = Math.ceil(baseRotation / (2 * Math.PI)) * 2 * Math.PI;
		} else if (this.result === 'tails') {
			// Докручиваем до четкого положения решки (180 градусов)
			this.targetRotation = Math.ceil(baseRotation / (2 * Math.PI)) * 2 * Math.PI + Math.PI;
		} else {
			// Для ребра - всегда перпендикулярно плоскости (90 градусов)
			this.targetRotation = Math.ceil(baseRotation / (2 * Math.PI)) * 2 * Math.PI + Math.PI / 2;
		}

		this.resultText.textContent = '';
		this.resultText.className = '';
	}

	private onWindowResize(): void {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	private animate = (): void => {
		requestAnimationFrame(this.animate);

		if (this.tossing) {
			const elapsed = performance.now() - this.tossStart;
			const t = Math.min(elapsed / this.tossDuration, 1);

			// Реалистичная физика с замедлением
			const eased = 1 - Math.pow(1 - t, 4); // Более резкое замедление

			// Применяем только вращение вокруг оси Z
			this.coin.rotation.z = eased * this.targetRotation;

			// Добавляем подпрыгивание и падение с плавными переходами
			let height;
			if (t < 0.3) {
				// Фаза подбрасывания - монетка подпрыгивает
				height = Math.sin(t * Math.PI * 3) * 1.5;
			} else if (t < 0.7) {
				// Фаза падения - монетка падает с плавным переходом
				const fallT = (t - 0.3) / 0.4;
				const easedFallT = 1 - Math.pow(1 - fallT, 2); // Плавное замедление
				height = (1 - easedFallT) * 1.5;
			} else {
				// Фаза лежания - монетка лежит на столе
				height = 0;
			}

			// Плавно применяем высоту
			this.coin.position.y = height;

			if (t >= 1) {
				this.tossing = false;

				// Показываем результат
				this.resultText.className = '';
				let resultMessage = '';

				switch (this.result) {
					case 'heads':
						resultMessage = 'Орёл!';
						break;
					case 'tails':
						resultMessage = 'Решка!';
						break;
					case 'edge':
						resultMessage = 'РЕБРО!';
						this.resultText.className = 'edge';
						break;
				}

				// Добавляем информацию о ставке и выплатах
				if (this.userBet) {
					const payout = this.calculatePayout();
					if (payout > 0) {
						this.balance += payout;
						resultMessage += ` - ВЫИГРЫШ ${payout.toFixed(2)}! 🎉`;
					} else {
						resultMessage += ' - Проигрыш 😔';
					}
					this.updateBalanceDisplay();
				}

				this.resultText.textContent = resultMessage;
				this.enableBettingButtons();
			}
		}

		this.renderer.render(this.scene, this.camera);
	};
}

// Запускаем игру
new CoinTossGame();
