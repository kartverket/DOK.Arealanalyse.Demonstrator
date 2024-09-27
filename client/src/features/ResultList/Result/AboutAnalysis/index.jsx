import { useCollapse } from 'react-collapsed';
import styles from './AboutAnalysis.module.scss';

export default function AboutAnalysis({ result }) {
   const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

   function getDistanceToObject() {
      return result.distanceToObject <= 20000 ?
         `${result.distanceToObject.toLocaleString('nb-NO')} m` :
         `> 20 000 m`;
   }

   return (
      <div className={`expandable ${isExpanded ? 'expanded' : ''}`}>
         <div className="trigger" role="button" {...getToggleProps()}>
            Om analysen
         </div>

         <section {...getCollapseProps()}>
            <ul className={styles.ul}>
               <li>
                  Algoritmer kjørt:
                  <ol>
                     {
                        result.runAlgorithm.map(algorithm => <li key={algorithm}>{algorithm}</li>)
                     }
                  </ol>
               </li>
               <li>
                  Buffer brukt: {result.buffer.toLocaleString('nb-NO')} m
               </li>
               {
                  result.distanceToObject > 0 ?
                     <li>Avstand til nærmeste objekt: {getDistanceToObject()}</li> :
                     null
               }
               {
                  result.inputGeometryArea ?
                     <li>Områdeareal: {result.inputGeometryArea.toLocaleString('nb-NO')} m²</li> :
                     null
               }
               {
                  result.hitArea ?
                     <li>Treffareal: {result.hitArea.toLocaleString('nb-NO')} m²</li> :
                     null
               }
            </ul>
         </section>
      </div>
   );
}