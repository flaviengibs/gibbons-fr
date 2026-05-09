import { PrismaClient, BranchRelationType, SwingType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('seed : debut...');

  // ─── Foret ───────────────────────────────────────────────────────────────

  const forest = await db.forest.upsert({
    where: { slug: 'penser-mieux' },
    update: {},
    create: {
      name: 'Penser mieux',
      slug: 'penser-mieux',
      description: 'Biais cognitifs, logique, decision, persuasion et heuristiques.',
    },
  });

  console.log('foret creee :', forest.name);

  // ─── Branches ────────────────────────────────────────────────────────────

  const branchDefs = [
    { name: 'Biais cognitifs', slug: 'biais-cognitifs' },
    { name: 'Logique et raisonnement', slug: 'logique-raisonnement' },
    { name: 'Prise de decision', slug: 'prise-de-decision' },
    { name: 'Persuasion et influence', slug: 'persuasion-influence' },
    { name: 'Heuristiques', slug: 'heuristiques' },
  ];

  const branches: Record<string, string> = {};

  for (const def of branchDefs) {
    const branch = await db.branch.upsert({
      where: { forestId_slug: { forestId: forest.id, slug: def.slug } },
      update: {},
      create: { name: def.name, slug: def.slug, forestId: forest.id },
    });
    branches[def.slug] = branch.id;
    console.log('branche creee :', branch.name);
  }

  // ─── Utilisateur editorial ───────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('gibbons-editor-2026', 12);

  const editor = await db.user.upsert({
    where: { email: 'editor@gibbons.fr' },
    update: {},
    create: {
      email: 'editor@gibbons.fr',
      name: 'Equipe Gibbons',
      passwordHash,
      role: 'CREATOR',
      isEditorial: true,
    },
  });

  console.log('editeur cree :', editor.email);

  // ─── Swings ──────────────────────────────────────────────────────────────

  type SwingDef = {
    title: string;
    type: SwingType;
    branchSlug: string;
    estimatedDuration: number;
    content: object;
  };

  const swingDefs: SwingDef[] = [
    // ── TYPE_A : biais cognitifs (10) ──────────────────────────────────────
    {
      title: 'Le biais de confirmation',
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: 'On cherche naturellement les informations qui confirment nos croyances existantes, en ignorant celles qui les contredisent. Ce biais renforce nos opinions sans les remettre en question.', visualUrl: '', animationData: {} },
    },
    {
      title: "L'effet de halo",
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "Une premiere impression positive colore toute notre perception d'une personne. Si quelqu'un est beau ou charismatique, on lui attribue automatiquement d'autres qualites.", visualUrl: '', animationData: {} },
    },
    {
      title: 'Le biais de disponibilite',
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "On surestime la probabilite des evenements faciles a memoriser ou recemment vecus. Apres avoir vu un reportage sur des requins, on surestime le risque d'attaque.", visualUrl: '', animationData: {} },
    },
    {
      title: "L'ancrage cognitif",
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "Le premier chiffre ou la premiere information entendue influence toutes nos estimations suivantes. Si on vous dit qu'un produit vaut 1000 euros avant de vous proposer 400 euros, 400 semble une bonne affaire.", visualUrl: '', animationData: {} },
    },
    {
      title: 'Le biais du survivant',
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "On ne voit que les succes, pas les echecs qui ont disparu. Les entrepreneurs qui ont reussi parlent de leur audace — ceux qui ont echoue avec la meme audace sont invisibles.", visualUrl: '', animationData: {} },
    },
    {
      title: "L'effet Dunning-Kruger",
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 75,
      content: { type: 'TYPE_A', text: "Les moins competents dans un domaine surestiment souvent leurs capacites, car ils manquent des connaissances necessaires pour mesurer leur ignorance.", visualUrl: '', animationData: {} },
    },
    {
      title: 'Le biais de statu quo',
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "On prefere l'etat actuel des choses meme quand changer serait benefique. Le changement est percu comme une perte potentielle plutot que comme un gain.", visualUrl: '', animationData: {} },
    },
    {
      title: 'La pensee de groupe',
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 75,
      content: { type: 'TYPE_A', text: "Dans un groupe, la pression sociale pousse a l'uniformite des opinions. Les membres evitent d'exprimer des doutes pour ne pas perturber la cohesion.", visualUrl: '', animationData: {} },
    },
    {
      title: 'Le biais retrospectif',
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "Apres un evenement, on croit qu'on l'avait prevu. Ce biais nous empeche d'apprendre de nos erreurs car on pense avoir toujours su.", visualUrl: '', animationData: {} },
    },
    {
      title: "L'effet de cadrage",
      type: 'TYPE_A',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "La facon dont une information est presentee change notre decision. '90% de survie' et '10% de mortalite' sont identiques, mais la premiere option est toujours preferee.", visualUrl: '', animationData: {} },
    },
    // ── TYPE_A : logique, decision, persuasion, heuristiques (5) ──────────
    {
      title: 'Le rasoir d\'Occam',
      type: 'TYPE_A',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "Parmi plusieurs explications, la plus simple est generalement la bonne. Ne pas multiplier les hypotheses sans necessite.", visualUrl: '', animationData: {} },
    },
    {
      title: 'La loi de Goodhart',
      type: 'TYPE_A',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 75,
      content: { type: 'TYPE_A', text: "Quand une mesure devient un objectif, elle cesse d'etre une bonne mesure. Les indicateurs de performance finissent par etre optimises au detriment de ce qu'ils etaient censes mesurer.", visualUrl: '', animationData: {} },
    },
    {
      title: 'La preuve sociale',
      type: 'TYPE_A',
      branchSlug: 'persuasion-influence',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "On tend a faire ce que les autres font, surtout dans l'incertitude. Les avis clients, les notes et les temoignages exploitent ce mecanisme.", visualUrl: '', animationData: {} },
    },
    {
      title: "L'heuristique de representativite",
      type: 'TYPE_A',
      branchSlug: 'heuristiques',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "On juge la probabilite d'un evenement selon sa ressemblance avec un prototype. Un homme timide qui aime la lecture semble plus bibliothecaire que camionneur — meme si les camionneurs sont bien plus nombreux.", visualUrl: '', animationData: {} },
    },
    {
      title: "L'heuristique d'affect",
      type: 'TYPE_A',
      branchSlug: 'heuristiques',
      estimatedDuration: 60,
      content: { type: 'TYPE_A', text: "Nos emotions influencent nos jugements de risque et de benefice. Ce qu'on aime semble moins risque et plus benefique que ce qu'on n'aime pas.", visualUrl: '', animationData: {} },
    },

    // ── TYPE_B : mini defis (15) ───────────────────────────────────────────
    {
      title: 'Quel biais ? — le cas du medecin',
      type: 'TYPE_B',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Un medecin voit 10 patients avec les memes symptomes. Il diagnostique les 10 avec la meme maladie rare qu'il a etudiee recemment. Quel biais est en jeu ?", options: ['Biais de confirmation', 'Biais de disponibilite', 'Effet de halo', 'Biais du survivant'], correctIndex: 1, explanation: "C'est le biais de disponibilite : la maladie recemment etudiee est plus facilement accessible en memoire, ce qui fausse le diagnostic." },
    },
    {
      title: 'Vrai ou faux ? — le syllogisme',
      type: 'TYPE_B',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Tous les chats sont des animaux. Tous les animaux sont mortels. Donc tous les chats sont mortels. Ce raisonnement est-il valide ?", options: ['Vrai — le raisonnement est valide', 'Faux — la conclusion ne suit pas', 'Impossible a determiner', 'Valide mais non pertinent'], correctIndex: 0, explanation: "C'est un syllogisme valide : si A implique B et B implique C, alors A implique C. La forme logique est correcte." },
    },
    {
      title: 'Detectez le sophisme',
      type: 'TYPE_B',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: '"Tu ne peux pas critiquer la politique economique du gouvernement, tu n\'as meme pas de diplome en economie." Quel sophisme est utilise ?', options: ['Appel a l\'autorite', 'Ad hominem', 'Homme de paille', 'Fausse dichotomie'], correctIndex: 1, explanation: "C'est un ad hominem : on attaque la personne plutot que l'argument. L'absence de diplome ne rend pas la critique invalide." },
    },
    {
      title: 'Le dilemme du tramway',
      type: 'TYPE_B',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Un tramway fou fonce vers 5 personnes. Vous pouvez actionner un aiguillage pour le devier vers une voie ou se trouve 1 personne. Quelle approche ethique justifie d'actionner l'aiguillage ?", options: ['L\'utilitarisme (maximiser le bien-etre global)', 'La deontologie kantienne (ne jamais utiliser autrui comme moyen)', 'L\'ethique de la vertu (agir comme une personne vertueuse)', 'Le relativisme moral (tout depend du contexte)'], correctIndex: 0, explanation: "L'utilitarisme justifie l'action : sauver 5 vies au prix d'une maximise le bien-etre global. La deontologie s'y opposerait car on utilise la 1 personne comme moyen." },
    },
    {
      title: 'Quel biais ? — les actions en hausse',
      type: 'TYPE_B',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Un investisseur vend ses actions perdantes rapidement mais garde ses actions gagnantes trop longtemps, esperant qu'elles montent encore. Quel biais explique ce comportement ?", options: ['Biais de confirmation', 'Aversion a la perte', 'Effet de dotation', 'Biais d\'optimisme'], correctIndex: 1, explanation: "C'est l'aversion a la perte : les pertes sont psychologiquement deux fois plus douloureuses que les gains equivalents. On evite de realiser une perte." },
    },
    {
      title: 'Vrai ou faux ? — la correlation',
      type: 'TYPE_B',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Les pays qui consomment le plus de chocolat produisent le plus de laureats Nobel. Peut-on conclure que manger du chocolat rend plus intelligent ?", options: ['Oui — la correlation prouve la causalite', 'Non — correlation ne signifie pas causalite', 'Oui — si la correlation est forte', 'Impossible a determiner sans plus de donnees'], correctIndex: 1, explanation: "Correlation ne signifie pas causalite. Un troisieme facteur (richesse du pays) explique probablement les deux variables." },
    },
    {
      title: 'Quel principe de persuasion ?',
      type: 'TYPE_B',
      branchSlug: 'persuasion-influence',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: '"Seulement 3 articles restants en stock !" Quel principe de persuasion ce message exploite-t-il ?', options: ['Reciprocite', 'Autorite', 'Rarete', 'Coherence'], correctIndex: 2, explanation: "C'est la rarete (Cialdini) : ce qui est rare ou limite semble plus desirable. La peur de manquer (FOMO) pousse a l'action immediate." },
    },
    {
      title: 'Heuristique ou raisonnement ?',
      type: 'TYPE_B',
      branchSlug: 'heuristiques',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Une batte et une balle coutent 1,10 euro au total. La batte coute 1 euro de plus que la balle. Combien coute la balle ?", options: ['10 centimes', '5 centimes', '1 euro', '50 centimes'], correctIndex: 1, explanation: "La reponse intuitive est 10 centimes (heuristique), mais c'est faux. Si la balle = x, alors batte = x + 1, et x + (x+1) = 1,10, donc x = 0,05 euro (5 centimes)." },
    },
    {
      title: 'Quel biais ? — le CV',
      type: 'TYPE_B',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Un recruteur recoit deux CV identiques, l'un avec le prenom 'Kevin', l'autre avec 'Alexandre'. Il rappelle plus souvent Alexandre. Quel biais est en jeu ?", options: ['Biais de confirmation', 'Biais de representativite', 'Biais implicite', 'Effet de halo'], correctIndex: 2, explanation: "C'est un biais implicite : des associations inconscientes liees au prenom influencent le jugement sans que le recruteur en soit conscient." },
    },
    {
      title: 'Vrai ou faux ? — la double negation',
      type: 'TYPE_B',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 75,
      content: { type: 'TYPE_B', problem: '"Il n\'est pas impossible que cette theorie soit fausse." Cette phrase signifie-t-elle que la theorie pourrait etre vraie ?', options: ['Oui — la double negation affirme la possibilite', 'Non — la double negation annule tout sens', 'Cela depend du contexte', 'La phrase est une tautologie'], correctIndex: 0, explanation: "'Pas impossible' = possible. La double negation en logique formelle equivaut a une affirmation : il est possible que la theorie soit fausse, donc elle pourrait aussi etre vraie." },
    },
    {
      title: 'Quel biais ? — la loterie',
      type: 'TYPE_B',
      branchSlug: 'heuristiques',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Apres avoir entendu parler d'un gagnant au loto dans son quartier, Paul achete plus de billets cette semaine. Quel biais explique son comportement ?", options: ['Biais de disponibilite', 'Biais de confirmation', 'Effet de halo', 'Biais d\'optimisme'], correctIndex: 0, explanation: "Le biais de disponibilite : l'evenement recent et memorable (le gagnant voisin) rend la victoire plus 'disponible' mentalement, ce qui surestime sa probabilite." },
    },
    {
      title: 'Principe de persuasion — le pied dans la porte',
      type: 'TYPE_B',
      branchSlug: 'persuasion-influence',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Un vendeur vous demande d'abord de signer une petition pour une cause que vous soutenez, puis vous demande un don. Quel principe exploite-t-il ?", options: ['Rarete', 'Coherence et engagement', 'Reciprocite', 'Preuve sociale'], correctIndex: 1, explanation: "C'est le principe de coherence : une fois qu'on a dit oui a une petite demande, on tend a rester coherent avec cette position et a accepter des demandes plus importantes." },
    },
    {
      title: 'Quel biais ? — le medecin et le patient',
      type: 'TYPE_B',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Un medecin prescrit un traitement qu'il a toujours utilise, meme si de nouvelles etudes montrent qu'un autre traitement est plus efficace. Quel biais est en jeu ?", options: ['Biais de confirmation', 'Biais de statu quo', 'Effet Dunning-Kruger', 'Biais retrospectif'], correctIndex: 1, explanation: "C'est le biais de statu quo : on prefere maintenir les pratiques existantes meme face a des preuves favorisant le changement." },
    },
    {
      title: 'Vrai ou faux ? — l\'argument d\'autorite',
      type: 'TYPE_B',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 75,
      content: { type: 'TYPE_B', problem: '"Un prix Nobel de physique affirme que cette therapie alternative fonctionne." Cet argument est-il valide pour soutenir l\'efficacite de la therapie ?', options: ['Oui — un Nobel est une autorite credible', 'Non — l\'expertise en physique ne valide pas une therapie', 'Oui — si le Nobel a etudie la question', 'Cela depend de la therapie'], correctIndex: 1, explanation: "C'est un appel a une autorite non pertinente. L'expertise en physique ne confere pas de credibilite en medecine. L'autorite doit etre dans le domaine concerne." },
    },
    {
      title: 'Quel biais ? — le projet informatique',
      type: 'TYPE_B',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 90,
      content: { type: 'TYPE_B', problem: "Une entreprise a investi 2 millions dans un logiciel qui ne fonctionne pas. Plutot que d'arreter, elle investit 500 000 euros de plus pour 'ne pas perdre ce qu'elle a deja depense'. Quel biais est en jeu ?", options: ['Biais de confirmation', 'Cout irrecuperable (sunk cost fallacy)', 'Biais d\'optimisme', 'Effet de dotation'], correctIndex: 1, explanation: "C'est la sunk cost fallacy : les couts passes ne doivent pas influencer les decisions futures. Seuls les couts et benefices futurs comptent rationnellement." },
    },
    // ── TYPE_C : application (15) ──────────────────────────────────────────
    {
      title: 'Reformulez pour convaincre',
      type: 'TYPE_C',
      branchSlug: 'persuasion-influence',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Reformulez cette phrase pour la rendre plus persuasive en utilisant le cadrage positif : 'Ce traitement echoue dans 30% des cas.'", inputType: 'text', rubric: "Une bonne reponse utilise le cadrage positif : 'Ce traitement reussit dans 70% des cas.' ou similaire. Le sens reste identique mais la presentation change la perception." },
    },
    {
      title: 'Identifiez le biais publicitaire',
      type: 'TYPE_C',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Lisez cette publicite et identifiez le biais cognitif exploite : '9 dentistes sur 10 recommandent ce dentifrice. Ne soyez pas le seul a ne pas l'utiliser !'", inputType: 'text', rubric: "La publicite exploite deux biais : l'appel a l'autorite (9 dentistes sur 10) et la preuve sociale / peur d'exclusion ('ne soyez pas le seul')." },
    },
    {
      title: 'Construisez un argument valide',
      type: 'TYPE_C',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Construisez un syllogisme valide a partir de ces deux premisses : 'Tous les mammiferes respirent.' et 'Les dauphins sont des mammiferes.'", inputType: 'text', rubric: "La conclusion valide est : 'Donc les dauphins respirent.' La forme est : Tous A sont B. X est A. Donc X est B." },
    },
    {
      title: 'Detectez le biais dans cet email',
      type: 'TYPE_C',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Identifiez le ou les biais dans cet email de vente : 'Offre exclusive ! Seulement 5 places restantes. Nos 2000 clients satisfaits ne peuvent pas se tromper. Rejoignez-les avant ce soir !'", inputType: 'text', rubric: "L'email exploite : la rarete ('5 places restantes'), la preuve sociale ('2000 clients'), et l'urgence artificielle ('avant ce soir')." },
    },
    {
      title: 'Reformulez sans biais de cadrage',
      type: 'TYPE_C',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Reformulez cette phrase de facon neutre, sans cadrage positif ni negatif : 'Ce placement financier a une chance sur cinq de vous faire perdre de l\'argent.'", inputType: 'text', rubric: "Une formulation neutre : 'Ce placement a une probabilite de 20% de perte et 80% de gain.' ou 'Ce placement peut perdre de la valeur dans 1 cas sur 5.'" },
    },
    {
      title: 'Appliquez le rasoir d\'Occam',
      type: 'TYPE_C',
      branchSlug: 'heuristiques',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Votre voiture ne demarre pas. Proposez deux explications : une simple (rasoir d'Occam) et une complexe. Laquelle privilegieriez-vous en premier ?", inputType: 'text', rubric: "Explication simple : batterie decharge ou cle mal inseree. Explication complexe : defaillance du systeme d'injection combinee a un probleme electrique. Le rasoir d'Occam suggere de verifier d'abord la batterie." },
    },
    {
      title: 'Identifiez le sophisme',
      type: 'TYPE_C',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Identifiez et nommez le sophisme dans cet argument : 'Soit vous etes avec nous, soit vous etes contre nous. Vous n\'avez pas soutenu notre projet, donc vous etes notre ennemi.'", inputType: 'text', rubric: "C'est une fausse dichotomie (ou faux dilemme) : l'argument presente seulement deux options alors qu'il en existe d'autres (neutralite, desaccord partiel, etc.)." },
    },
    {
      title: 'Contre-argumentez le biais du survivant',
      type: 'TYPE_C',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Quelqu'un vous dit : 'Mon grand-pere a fume toute sa vie et a vecu jusqu'a 95 ans, donc fumer n'est pas si dangereux.' Formulez un contre-argument en citant le biais du survivant.", inputType: 'text', rubric: "Contre-argument : c'est le biais du survivant. On ne voit que les cas exceptionnels qui ont survecu. Les millions de fumeurs morts prematurement ne sont pas visibles dans cet argument." },
    },
    {
      title: 'Utilisez la preuve sociale ethiquement',
      type: 'TYPE_C',
      branchSlug: 'persuasion-influence',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Vous lancez une application. Redigez un message marketing qui utilise la preuve sociale de facon ethique (sans manipulation ni exageration).", inputType: 'text', rubric: "Une bonne reponse cite des chiffres reels, des temoignages authentiques, ou des cas d'usage concrets. Elle evite les superlatifs non verifiables et les faux chiffres." },
    },
    {
      title: 'Analysez une decision sous biais',
      type: 'TYPE_C',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Decrivez une decision que vous avez prise recemment. Identifiez un biais cognitif qui a pu l'influencer et expliquez comment vous auriez pu le contrer.", inputType: 'text', rubric: "Une bonne reponse identifie clairement un biais (confirmation, disponibilite, ancrage, etc.), explique son influence sur la decision, et propose une strategie concrete de debiaisage." },
    },
    {
      title: 'Reformulez avec l\'heuristique appropriee',
      type: 'TYPE_C',
      branchSlug: 'heuristiques',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Vous devez estimer combien de pizzerias il y a dans votre ville. Utilisez l'heuristique de Fermi pour faire une estimation raisonnee en 3 etapes.", inputType: 'text', rubric: "Une bonne reponse decompose le probleme : population / taille d'un groupe qui commande une pizza / frequence de commande = nombre de pizzas par jour / capacite d'une pizzeria = nombre de pizzerias." },
    },
    {
      title: 'Construisez un argument persuasif',
      type: 'TYPE_C',
      branchSlug: 'persuasion-influence',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Redigez un argument de 3 phrases pour convaincre un ami de lire davantage. Utilisez au moins deux principes de persuasion de Cialdini.", inputType: 'text', rubric: "Une bonne reponse utilise par exemple la preuve sociale ('des etudes montrent que...'), la reciprocite ('je te recommande ce livre qui m'a aide'), ou l'autorite ('des experts en neurosciences affirment...')." },
    },
    {
      title: 'Identifiez le cout irrecuperable',
      type: 'TYPE_C',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Vous avez achete un billet de concert a 80 euros. Le soir du concert, vous etes epuise et il pleut. Analysez la decision de y aller ou non en ignorant le cout irrecuperable.", inputType: 'text', rubric: "Une bonne reponse ignore les 80 euros (deja depenses, non recuperables) et se concentre sur les couts/benefices futurs : plaisir attendu vs fatigue et inconfort. La decision rationnelle ne tient pas compte du billet." },
    },
    {
      title: 'Debiaisez ce raisonnement',
      type: 'TYPE_C',
      branchSlug: 'logique-raisonnement',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Identifiez et corrigez le raisonnement circulaire dans cet argument : 'La Bible est vraie parce qu'elle est la parole de Dieu, et on sait que c'est la parole de Dieu parce que la Bible le dit.'", inputType: 'text', rubric: "C'est un raisonnement circulaire (petitio principii) : la conclusion est utilisee comme premisse. Pour le corriger, il faudrait une source externe independante pour valider chaque affirmation." },
    },
    {
      title: 'Appliquez l\'heuristique de disponibilite',
      type: 'TYPE_C',
      branchSlug: 'heuristiques',
      estimatedDuration: 90,
      content: { type: 'TYPE_C', prompt: "Donnez un exemple personnel ou professionnel ou l'heuristique de disponibilite vous a conduit a une mauvaise estimation. Expliquez comment vous auriez pu corriger ce biais.", inputType: 'text', rubric: "Une bonne reponse identifie un evenement recent ou memorable qui a fausse une estimation de probabilite, et propose une correction basee sur des statistiques ou des donnees objectives." },
    },
    // ── TYPE_D : reflexion guidee (5) ──────────────────────────────────────
    {
      title: 'Avez-vous deja subi le biais de confirmation ?',
      type: 'TYPE_D',
      branchSlug: 'biais-cognitifs',
      estimatedDuration: 75,
      content: { type: 'TYPE_D', question: "Pensez a une croyance forte que vous avez. Avez-vous deja ignore des informations qui la contredisaient ?", choices: ['Oui, souvent', 'Parfois, sans m\'en rendre compte', 'Rarement', 'Non, je suis tres ouvert aux contradictions'], anchorFeedback: "Le biais de confirmation est universel. La prise de conscience est la premiere etape : chercher activement des preuves contraires a nos croyances s'appelle la 'falsification active'." },
    },
    {
      title: 'Quelle heuristique utilisez-vous le plus ?',
      type: 'TYPE_D',
      branchSlug: 'heuristiques',
      estimatedDuration: 75,
      content: { type: 'TYPE_D', question: "Dans vos decisions quotidiennes, quelle heuristique utilisez-vous le plus souvent ?", choices: ['Je fais confiance a mon instinct (affect)', 'Je fais ce que font les autres (representativite)', 'Je me base sur ce dont je me souviens (disponibilite)', 'Je pars du premier chiffre entendu (ancrage)'], anchorFeedback: "Toutes ces heuristiques sont utiles dans certains contextes mais peuvent mener a des erreurs. Les reconnaitre permet de choisir quand les utiliser et quand les depasser." },
    },
    {
      title: 'Comment prenez-vous vos grandes decisions ?',
      type: 'TYPE_D',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 75,
      content: { type: 'TYPE_D', question: "Face a une decision importante, quelle est votre approche habituelle ?", choices: ['Je liste les pour et les contre', 'Je fais confiance a mon intuition', 'Je demande l\'avis de mon entourage', 'Je reporte la decision jusqu\'a la derniere minute'], anchorFeedback: "Chaque approche a ses forces et ses limites. La recherche montre que combiner analyse rationnelle et intuition donne souvent de meilleurs resultats que l'une ou l'autre seule." },
    },
    {
      title: 'Etes-vous sensible a la preuve sociale ?',
      type: 'TYPE_D',
      branchSlug: 'persuasion-influence',
      estimatedDuration: 75,
      content: { type: 'TYPE_D', question: "Avez-vous deja change d'avis ou de comportement parce que 'tout le monde le fait' ?", choices: ['Oui, regulierement', 'Parfois, dans certains contextes', 'Rarement, je suis independant', 'Non, jamais'], anchorFeedback: "La preuve sociale est un mecanisme evolutif : suivre le groupe etait souvent une strategie de survie. Aujourd'hui, elle peut etre exploitee. La conscience de ce biais aide a distinguer conformisme utile et manipulation." },
    },
    {
      title: 'Votre rapport au changement',
      type: 'TYPE_D',
      branchSlug: 'prise-de-decision',
      estimatedDuration: 75,
      content: { type: 'TYPE_D', question: "Face a un changement benefique mais inconfortable, quelle est votre reaction spontanee ?", choices: ['J\'adopte le changement rapidement', 'J\'hesite mais je finis par changer', 'Je resiste et je prefere l\'habitude', 'Cela depend entierement du contexte'], anchorFeedback: "Le biais de statu quo est naturel : le cerveau economise de l'energie en maintenant les habitudes. Reconnaitre cette resistance permet de distinguer une vraie raison de ne pas changer d'une simple inertie cognitive." },
    },
  ];

  // creer les swings
  const swingIds: string[] = [];

  for (const def of swingDefs) {
    const branchId = branches[def.branchSlug];
    if (!branchId) {
      console.warn('branche introuvable :', def.branchSlug);
      continue;
    }

    const swing = await db.swing.upsert({
      where: {
        // on utilise un identifiant stable base sur le titre + branche
        id: Buffer.from(def.title + def.branchSlug).toString('base64').slice(0, 25),
      },
      update: {
        title: def.title,
        content: def.content,
        estimatedDuration: def.estimatedDuration,
        isPublished: true,
        publishedAt: new Date(),
        qualityScore: 3.5 + Math.random() * 1.5,
        editorialScore: 4.0,
      },
      create: {
        id: Buffer.from(def.title + def.branchSlug).toString('base64').slice(0, 25),
        type: def.type,
        title: def.title,
        content: def.content,
        estimatedDuration: def.estimatedDuration,
        branchId,
        creatorId: editor.id,
        isPublished: true,
        publishedAt: new Date(),
        qualityScore: 3.5 + Math.random() * 1.5,
        editorialScore: 4.0,
      },
    });

    swingIds.push(swing.id);
  }

  console.log(`${swingIds.length} swings crees`);

  // ─── SwingEdge : graphe de navigation ────────────────────────────────────

  const relationTypes: BranchRelationType[] = [
    'CONCEPT_LIE',
    'DIFFICULTE_DIFFERENTE',
    'SURPRISE',
  ];

  let edgeCount = 0;

  for (let i = 0; i < swingIds.length; i++) {
    const sourceId = swingIds[i];

    // selectionner 3 cibles distinctes parmi les autres swings
    const targets: string[] = [];
    const usedIndices = new Set<number>([i]);

    // 1 cible proche (meme branche si possible)
    const sameBranchIdx = swingIds.findIndex(
      (id, idx) => idx !== i && !usedIndices.has(idx) && swingDefs[idx]?.branchSlug === swingDefs[i]?.branchSlug,
    );
    if (sameBranchIdx !== -1) {
      targets.push(swingIds[sameBranchIdx]);
      usedIndices.add(sameBranchIdx);
    }

    // 2 cibles aleatoires dans d'autres branches
    let attempts = 0;
    while (targets.length < 3 && attempts < 50) {
      const randIdx = Math.floor(Math.random() * swingIds.length);
      if (!usedIndices.has(randIdx)) {
        targets.push(swingIds[randIdx]);
        usedIndices.add(randIdx);
      }
      attempts++;
    }

    // creer les aretes
    for (let j = 0; j < targets.length; j++) {
      const relationType = relationTypes[j % 3];
      const weight = 0.5 + Math.random() * 0.5;

      try {
        await db.swingEdge.upsert({
          where: {
            sourceSwingId_targetSwingId: {
              sourceSwingId: sourceId,
              targetSwingId: targets[j],
            },
          },
          update: { weight },
          create: {
            sourceSwingId: sourceId,
            targetSwingId: targets[j],
            relationType,
            weight,
          },
        });
        edgeCount++;
      } catch {
        // ignore les doublons
      }
    }
  }

  console.log(`${edgeCount} aretes creees`);
  console.log('seed termine avec succes !');
}

main()
  .catch((e) => {
    console.error('erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
