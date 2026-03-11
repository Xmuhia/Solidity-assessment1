const express = require('express');
const ethers = require('ethers');

const router = express.Router();

const CHAINLINK_ABI = [
    {
        inputs: [],
        name: 'latestRoundData',
        outputs: [
            {internalType: 'uint80', name: 'roundId', type: 'uint80'},
            {internalType: 'int256', name: 'answer', type: 'int256'},
            {internalType: 'uint256', name: 'startedAt', type: 'uint256'},
            {internalType: 'uint256', name: 'updatedAt', type: 'uint256'},
            {internalType: 'uint80', name: 'roundId', type: 'uint80'},
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [{internalType: 'uint8', name:'', type: 'uint8'}],
        stateMutability: 'view',
        type: 'function',

    },
    {
        inputs: [],
        name: 'description',
        outputs: [{internalType: 'uint8', name:'', type: 'string'}],
        stateMutability: 'view',
        type: 'function',

    },   
];

const CHAINLINK_ETH_USD_ADDRESS ='0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

router.get('/', async (req, res, next) => 
{ try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');

    const priceFeed = new ethers.Contract(
        CHAINLINK_ETH_USD_ADDRESS,
        CHAINLINK_ABI,
        provider
    );

    const [description, decimals, roundData] = await Promise.all([
        priceFeed.description(),
        priceFeed.decimals(),
        priceFeed.latestRoundData()
    ]);
    
    const [roundId, answer, startedAt, updatedAt] = roundData;

    const price = (Number(answer) / 10 ** Number(decimals)).toFixed(2);
    const UpdatedAtISO = new Date(Number(updatedAt) * 1000).toISOString();

    const result = {
        success: true,
        feed: description,
        price: `$${price}`,
        roundId: roundId.toString(),
        updatedAt: UpdatedAtISO,
        rawAnswer: answer.toString(),
    };

    console.log('n=========[chainlinkApiTest] Chainlink price feed=======')
    console.log(`Feed: ${result.feed}`)
    console.log(`Price: ${result.price}`)
    console.log(`Round Id: ${result.roundId}`)
    console.log('========================\n')

    res.json(result); 
} catch (err){
    console.error('[ChainlinkApiTest] error fetching', err.message)
}
})

module.exports = router;
